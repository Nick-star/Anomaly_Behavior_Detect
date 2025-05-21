package services

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"backend/config"
	"backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/net/websocket"
)

type AlertService struct {
	Collection *mongo.Collection
}

type AlertFilter struct {
	CameraID  string
	Status    string
	StartDate time.Time
	EndDate   time.Time
}

type AlertPagination struct {
	Page     int64
	PageSize int64
	SortBy   string
	SortDesc bool
}

func NewAlertService() *AlertService {
	return &AlertService{
		Collection: config.GetCollection("alerts"),
	}
}

func (s *AlertService) GetAlerts(filter AlertFilter, pagination AlertPagination) ([]models.Alert, int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filterQuery := bson.M{}
	if filter.CameraID != "" {
		cameraID, err := primitive.ObjectIDFromHex(filter.CameraID)
		if err == nil {
			filterQuery["cameraId"] = cameraID
		}
	}
	if filter.Status != "" {
		filterQuery["status"] = filter.Status
	}
	if !filter.StartDate.IsZero() {
		filterQuery["createdAt"] = bson.M{"$gte": filter.StartDate}
	}
	if !filter.EndDate.IsZero() {
		if filterQuery["createdAt"] == nil {
			filterQuery["createdAt"] = bson.M{}
		}
		filterQuery["createdAt"].(bson.M)["$lte"] = filter.EndDate
	}

	total, err := s.Collection.CountDocuments(ctx, filterQuery)
	if err != nil {
		return nil, 0, err
	}

	sortOptions := bson.D{}
	if pagination.SortBy != "" {
		sortValue := 1
		if pagination.SortDesc {
			sortValue = -1
		}
		sortOptions = append(sortOptions, bson.E{Key: pagination.SortBy, Value: sortValue})
	}

	skip := (pagination.Page - 1) * pagination.PageSize
	findOptions := options.Find().
		SetSort(sortOptions).
		SetSkip(skip).
		SetLimit(pagination.PageSize)

	cursor, err := s.Collection.Find(ctx, filterQuery, findOptions)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var alerts []models.Alert
	if err = cursor.All(ctx, &alerts); err != nil {
		return nil, 0, err
	}

	return alerts, total, nil
}

func (s *AlertService) CreateAlert(alert *models.Alert) (*models.Alert, error) {
	alert.ID = primitive.NewObjectID()
	alert.StartDateTime = time.Now()
	alert.EndDateTime = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := s.Collection.InsertOne(ctx, alert)
	if err != nil {
		return nil, err
	}

	go s.broadcastNewAlert(alert)

	return alert, nil
}

var (
	wsClients    = make(map[*websocket.Conn]bool)
	wsClientsMux sync.RWMutex
)

func (s *AlertService) HandleWebSocket(conn *websocket.Conn) {
	wsClientsMux.Lock()
	wsClients[conn] = true
	wsClientsMux.Unlock()

	defer func() {
		wsClientsMux.Lock()
		delete(wsClients, conn)
		wsClientsMux.Unlock()
		conn.Close()
	}()

	for {
		_, err := conn.Read(make([]byte, 1024))
		if err != nil {
			break
		}
	}
}

func (s *AlertService) broadcastNewAlert(alert *models.Alert) {
	wsClientsMux.RLock()
	defer wsClientsMux.RUnlock()

	for client := range wsClients {
		data, err := json.Marshal(alert)
		if err != nil {
			client.Close()
			delete(wsClients, client)
			continue
		}
		_, err = client.Write(data)
		if err != nil {
			client.Close()
			delete(wsClients, client)
		}
	}
}
