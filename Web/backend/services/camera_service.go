package services

import (
	"context"
	"errors"
	"time"

	"backend/config"
	"backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CameraService struct {
	Collection *mongo.Collection
}

func NewCameraService() *CameraService {
	return &CameraService{
		Collection: config.GetCollection("cameras"),
	}
}

func (s *CameraService) GetAllCameras() ([]models.Camera, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var cameras []models.Camera
	cursor, err := s.Collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for {
		var batch []models.Camera
		if err := cursor.All(ctx, &batch); err != nil {
			return nil, err
		}
		cameras = append(cameras, batch...)
		if !cursor.Next(ctx) {
			break
		}
	}

	return cameras, nil
}

func (s *CameraService) GetCameraByID(id string) (*models.Camera, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Convert string ID to ObjectID
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("некорректный ID камеры")
	}

	// Find camera by ID
	var camera models.Camera
	err = s.Collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&camera)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("камера не найдена")
		}
		return nil, err
	}

	return &camera, nil
}

func (s *CameraService) CreateCamera(camera *models.Camera) (*models.Camera, error) {
	camera.ID = primitive.NewObjectID()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := s.Collection.InsertOne(ctx, camera)
	if err != nil {
		return nil, err
	}

	return camera, nil
}

func (s *CameraService) DeleteCamera(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("некорректный ID камеры")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = s.Collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return err
	}

	return nil
}
