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

type BuildingService struct {
	Collection *mongo.Collection
}

func NewBuildingService() *BuildingService {
	return &BuildingService{
		Collection: config.GetCollection("buildings"),
	}
}

func (s *BuildingService) GetAllBuildings() ([]models.Building, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var buildings []models.Building
	cursor, err := s.Collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for {
		var batch []models.Building
		if err := cursor.All(ctx, &batch); err != nil {
			return nil, err
		}
		buildings = append(buildings, batch...)
		if !cursor.Next(ctx) {
			break
		}
	}

	return buildings, nil
}

func (s *BuildingService) CreateBuilding(building *models.Building) (*models.Building, error) {
	building.ID = primitive.NewObjectID()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := s.Collection.InsertOne(ctx, building)
	if err != nil {
		return nil, err
	}

	return building, nil
}

func (s *BuildingService) GetBuildingByID(id string) (*models.Building, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var building models.Building
	err = s.Collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&building)
	if err != nil {
		return nil, err
	}

	return &building, nil
}

func (s *BuildingService) UpdateBuilding(id string, building *models.Building) (*models.Building, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("некорректный ID здания")
	}

	_, err = s.Collection.ReplaceOne(ctx, bson.M{"_id": objID}, building)
	if err != nil {
		return nil, err
	}

	return building, nil
}


func (s *BuildingService) DeleteBuilding(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("некорректный ID здания")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = s.Collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return err
	}

	return nil
}	

func (s *BuildingService) GetBuildingByCameraID(cameraID string) (*models.Building, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var building models.Building
	err := s.Collection.FindOne(ctx, bson.M{"cameras": cameraID}).Decode(&building)
	if err != nil {
		return nil, err
	}

	return &building, nil
}