package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Building struct {
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name    string             `bson:"name" json:"name"`
	Address string             `bson:"address" json:"address"`
	Floors  []Floor            `bson:"floors" json:"floors"`
	Matches bool               `bson:"matches,omitempty" json:"matches,omitempty"`
}