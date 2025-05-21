package services

import (
	"errors"
	"log"
	"net/url"
	"sync"
	"time"

	"github.com/deepch/vdk/av"
	"github.com/deepch/vdk/format/rtspv2"
)

// StreamClient represents a client connection to an RTSP stream
type StreamClient struct {
	UUID      string
	Signals   chan bool
	StartTime time.Time
}

// StreamConfig holds configuration for a stream
type StreamConfig struct {
	URL      string
	Username string
	Password string
	Options  map[string]string
}

// StreamSession holds information about an active stream
type StreamSession struct {
	Stream        *rtspv2.RTSPClient
	Clients       map[string]*StreamClient
	LatestPackets map[string][]av.Packet
	Config        StreamConfig
	Status        bool
	mutex         sync.Mutex
}

// StreamManager manages multiple RTSP streams
type StreamManager struct {
	mutex    sync.Mutex
	Streams  map[string]*StreamSession
	Timeouts map[string]time.Time
}

var streamManager *StreamManager
var once sync.Once

// GetStreamManager returns a singleton instance of the StreamManager
func GetStreamManager() *StreamManager {
	once.Do(func() {
		streamManager = &StreamManager{
			Streams:  make(map[string]*StreamSession),
			Timeouts: make(map[string]time.Time),
		}
	})
	return streamManager
}

// StartStream initializes and starts an RTSP stream
func (sm *StreamManager) StartStream(streamID string, config StreamConfig) error {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	// Check if stream already exists
	if _, ok := sm.Streams[streamID]; ok {
		return nil
	}

	// Create a new stream session
	session := &StreamSession{
		Config:        config,
		Status:        true,
		Clients:       make(map[string]*StreamClient),
		LatestPackets: make(map[string][]av.Packet),
	}

	// Set basic authentication if credentials provided
	rtspURL := config.URL
	if config.Username != "" && config.Password != "" {
		parsedURL, err := url.Parse(config.URL)
		if err == nil {
			parsedURL.User = url.UserPassword(config.Username, config.Password)
			rtspURL = parsedURL.String()
		}
	}

	// Connect to RTSP stream
	rtspClient, err := rtspv2.Dial(rtspv2.RTSPClientOptions{
		URL:              rtspURL,
		DisableAudio:     false,
		DialTimeout:      5 * time.Second,
		ReadWriteTimeout: 5 * time.Second,
		Debug:            false,
	})
	if err != nil {
		return err
	}

	// Store the connection
	session.Stream = rtspClient
	sm.Streams[streamID] = session

	// Start receiving packets
	go sm.receivePackets(streamID, session)

	return nil
}

// StopStream stops and cleans up an RTSP stream
func (sm *StreamManager) StopStream(streamID string) error {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	session, ok := sm.Streams[streamID]
	if !ok {
		return errors.New("stream not found")
	}

	// Notify clients that the stream is closing
	for _, client := range session.Clients {
		client.Signals <- false
	}

	// Close the RTSP connection
	if session.Stream != nil {
		session.Stream.Close()
	}

	// Clean up
	delete(sm.Streams, streamID)
	delete(sm.Timeouts, streamID)

	return nil
}

// AddClient registers a new client for a stream
func (sm *StreamManager) AddClient(streamID string, clientID string) (*StreamClient, error) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	session, ok := sm.Streams[streamID]
	if !ok {
		return nil, errors.New("stream not found")
	}

	session.mutex.Lock()
	defer session.mutex.Unlock()

	// Create new client
	client := &StreamClient{
		UUID:      clientID,
		Signals:   make(chan bool),
		StartTime: time.Now(),
	}

	// Add client to session
	session.Clients[clientID] = client

	// Return the client with signal channel for communication
	return client, nil
}

// RemoveClient unregisters a client from a stream
func (sm *StreamManager) RemoveClient(streamID string, clientID string) error {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	session, ok := sm.Streams[streamID]
	if !ok {
		return errors.New("stream not found")
	}

	session.mutex.Lock()
	defer session.mutex.Unlock()

	// Check if client exists
	client, ok := session.Clients[clientID]
	if !ok {
		return errors.New("client not found")
	}

	// Send signal to client
	close(client.Signals)

	// Remove client from session
	delete(session.Clients, clientID)

	// If no clients, consider stopping the stream after a timeout
	if len(session.Clients) == 0 {
		sm.Timeouts[streamID] = time.Now().Add(time.Minute * 5)
	}

	return nil
}

// GetClients returns all clients registered for a stream
func (sm *StreamManager) GetClients(streamID string) (map[string]*StreamClient, error) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	session, ok := sm.Streams[streamID]
	if !ok {
		return nil, errors.New("stream not found")
	}

	return session.Clients, nil
}

// receivePackets continually reads packets from the RTSP stream and stores them for clients
func (sm *StreamManager) receivePackets(streamID string, session *StreamSession) {
	for {
		pkt, err := session.Stream.Receive()
		if err != nil {
			log.Printf("Error reading packet from stream %s: %v", streamID, err)

			// Try to reconnect to the stream
			rtspURL := session.Config.URL
			if session.Config.Username != "" && session.Config.Password != "" {
				parsedURL, err := url.Parse(session.Config.URL)
				if err == nil {
					parsedURL.User = url.UserPassword(session.Config.Username, session.Config.Password)
					rtspURL = parsedURL.String()
				}
			}

			// Wait before retrying
			time.Sleep(5 * time.Second)

			// Attempt to reconnect
			rtspClient, err := rtspv2.Dial(rtspv2.RTSPClientOptions{
				URL:              rtspURL,
				DisableAudio:     false,
				DialTimeout:      5 * time.Second,
				ReadWriteTimeout: 5 * time.Second,
				Debug:            false,
			})
			if err != nil {
				log.Printf("Failed to reconnect to stream %s: %v", streamID, err)

				// If no clients are connected, stop the reconnection attempts
				session.mutex.Lock()
				if len(session.Clients) == 0 {
					session.mutex.Unlock()
					sm.mutex.Lock()
					delete(sm.Streams, streamID)
					sm.mutex.Unlock()
					return
				}
				session.mutex.Unlock()
				continue
			}

			// Update the stream client
			session.Stream = rtspClient
			continue
		}

		// Store latest packet by codec type
		session.mutex.Lock()
		codecType := pkt.Type.String()
		session.LatestPackets[codecType] = append(session.LatestPackets[codecType], pkt)

		// Keep only the most recent packets (to avoid memory issues)
		const maxPackets = 100
		if len(session.LatestPackets[codecType]) > maxPackets {
			session.LatestPackets[codecType] = session.LatestPackets[codecType][len(session.LatestPackets[codecType])-maxPackets:]
		}
		session.mutex.Unlock()

		// Check if there are no clients and timeout has expired
		sm.mutex.Lock()
		timeout, hasTimeout := sm.Timeouts[streamID]
		if hasTimeout && len(session.Clients) == 0 && time.Now().After(timeout) {
			sm.mutex.Unlock()
			log.Printf("No clients connected to stream %s, stopping", streamID)
			sm.StopStream(streamID)
			return
		}
		sm.mutex.Unlock()
	}
}

// GetStreamConfig retrieves the configuration for a stream
func (sm *StreamManager) GetStreamConfig(streamID string) (StreamConfig, error) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	session, ok := sm.Streams[streamID]
	if !ok {
		return StreamConfig{}, errors.New("stream not found")
	}

	return session.Config, nil
}

// GetLatestPackets retrieves the latest packets for a stream
func (sm *StreamManager) GetLatestPackets(streamID string) (map[string][]av.Packet, error) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	session, ok := sm.Streams[streamID]
	if !ok {
		return nil, errors.New("stream not found")
	}

	session.mutex.Lock()
	defer session.mutex.Unlock()

	// Make a shallow copy of the packets
	packets := make(map[string][]av.Packet)
	for codecType, codecPackets := range session.LatestPackets {
		packets[codecType] = codecPackets
	}

	return packets, nil
}
