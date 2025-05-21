package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Floor struct {
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name    string             `bson:"name" json:"name"`
	Cameras []Camera           `bson:"cameras" json:"cameras"`
	Matches bool               `bson:"matches,omitempty" json:"matches,omitempty"`
}
