package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AlertType string

const (
	AlertTypeIntrusion  AlertType = "Intrusion"
	AlertTypeFire       AlertType = "Fire"
	AlertTypeSuspicious AlertType = "Suspicious Activity"
	AlertTypeFight      AlertType = "Fight"
)

type Alert struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	AlertType     AlertType          `bson:"alert_type" json:"alert_type"`
	Source        string             `bson:"source" json:"source"`
	StartDateTime time.Time          `bson:"start_datetime" json:"start_datetime"`
	EndDateTime   time.Time          `bson:"end_datetime" json:"end_datetime"`
}
