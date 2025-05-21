package services

import (
	"context"
	"time"

	"backend/config"
	"backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type FloorService struct {
	Collection *mongo.Collection
}

func NewFloorService() *FloorService {
	return &FloorService{
		Collection: config.GetCollection("floors"),
	}
}



func (s *FloorService) GetAllFloors() ([]models.Floor, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var floors []models.Floor

	cursor, err := s.Collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	for {
		var batch []models.Floor
		if err := cursor.All(ctx, &batch); err != nil {
			return nil, err
		}
		floors = append(floors, batch...)
		if !cursor.Next(ctx) {
			break
		}
	}

	return floors, nil
}

func (s *FloorService) CreateFloor(floor *models.Floor) (*models.Floor, error) {
	floor.ID = primitive.NewObjectID()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := s.Collection.InsertOne(ctx, floor)
	if err != nil {
		return nil, err
	}

	return floor, nil
}

func (s *FloorService) DeleteFloor(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = s.Collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return err
	}

	return nil
}

func (s *FloorService) UpdateFloor(id string, floor *models.Floor) (*models.Floor, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = s.Collection.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": floor})
	if err != nil {
		return nil, err
	}

	return floor, nil
}

func (s *FloorService) GetFloorByID(id string) (*models.Floor, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var floor models.Floor
	err = s.Collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&floor)
	if err != nil {
		return nil, err
	}

	return &floor, nil
}