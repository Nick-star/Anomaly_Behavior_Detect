package controllers

import (
	"log"
	"net/http"
	"os/exec"
	"sync"
	"time"

	"backend/models"
	"backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var (
	streamControllerOnce sync.Once
	streamService        *services.CameraService
)

// InitStreamController initializes the stream controller
func InitStreamController() {
	streamControllerOnce.Do(func() {
		streamService = services.NewCameraService()
	})
}

// HandleStreamWebSocket handles WebSocket connections for streaming RTSP camera feeds
func HandleStreamWebSocket(c *gin.Context) {
	cameraID := c.Query("cameraId")
	if cameraID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Не указан идентификатор камеры"})
		return
	}

	// Get camera details
	camera, err := streamService.GetCameraByID(cameraID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Камера не найдена"})
		return
	}

	// Check if camera has RTSP URL
	if camera.RTSPUrl == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "У камеры нет настроенного RTSP потока"})
		return
	}

	// Upgrade to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection to WebSocket: %v", err)
		return
	}
	defer conn.Close()

	// Create unique ID for this client connection
	clientID := uuid.New().String()

	// Start the RTSP stream relay
	go relayRTSPStream(conn, camera, clientID)

	// Keep the connection alive with ping-pong
	go keepWebSocketAlive(conn)

	// Wait for close signal
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Printf("WebSocket connection closed: %v", err)
			break
		}
	}
}

// relayRTSPStream connects to RTSP stream and relays frames to WebSocket
func relayRTSPStream(conn *websocket.Conn, camera *models.Camera, clientID string) {
	// Create a command to stream using ffmpeg
	args := []string{
		"-i", formatRTSPUrl(camera),
		"-c:v", "libx264",
		"-preset", "ultrafast",
		"-tune", "zerolatency",
		"-f", "mpegts",
		"-fflags", "nobuffer",
		"-vf", "scale=640:-1",
		"-"} // Output to stdout

	// Create a process to run ffmpeg
	cmd := exec.Command("ffmpeg", args...)

	// Start the process
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Printf("Error creating stdout pipe: %v", err)
		sendErrorToWebSocket(conn, "Ошибка при создании потока")
		return
	}

	err = cmd.Start()
	if err != nil {
		log.Printf("Error starting ffmpeg: %v", err)
		sendErrorToWebSocket(conn, "Ошибка при запуске потока")
		return
	}

	// Read frames from ffmpeg and send to WebSocket
	buffer := make([]byte, 4096)
	for {
		n, err := stdout.Read(buffer)
		if err != nil {
			log.Printf("Error reading from ffmpeg: %v", err)
			break
		}

		if n > 0 {
			err = conn.WriteMessage(websocket.BinaryMessage, buffer[:n])
			if err != nil {
				log.Printf("Error writing to WebSocket: %v", err)
				break
			}
		}
	}

	// Clean up
	cmd.Process.Kill()
	cmd.Wait()
}

// formatRTSPUrl formats the RTSP URL with credentials if available
func formatRTSPUrl(camera *models.Camera) string {
	// Assume the RTSPUrl field already contains the full URL, potentially with credentials
	return camera.RTSPUrl
}

// keepWebSocketAlive sends ping messages to keep the connection alive
func keepWebSocketAlive(conn *websocket.Conn) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		if err := conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
			return
		}
	}
}

// sendErrorToWebSocket sends an error message to the WebSocket
func sendErrorToWebSocket(conn *websocket.Conn, message string) {
	conn.WriteJSON(gin.H{"error": message})
}
