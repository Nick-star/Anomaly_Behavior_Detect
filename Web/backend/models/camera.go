package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type CameraType string

const (
	CameraTypeCCTV    CameraType = "CCTV"
	CameraTypeIP      CameraType = "IP"
	CameraTypeThermal CameraType = "Thermal"
)

type CameraStatus string

const (
	CameraStatusActive   CameraStatus = "Active"
	CameraStatusInactive CameraStatus = "Inactive"
	CameraStatusFaulty   CameraStatus = "Faulty"
)

type Camera struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string             `bson:"name" json:"name"`
	Type         CameraType         `bson:"type" json:"type"`
	Status       CameraStatus       `bson:"status" json:"status"`
	Location     string             `bson:"location" json:"location"`
	BuildingID   primitive.ObjectID `bson:"buildingId,omitempty" json:"buildingId,omitempty"`
	FloorID      primitive.ObjectID `bson:"floorId,omitempty" json:"floorId,omitempty"`
	RTSPUrl      string             `bson:"rtspUrl" json:"rtspUrl"`
	RTSPUsername string             `bson:"rtspUsername" json:"rtspUsername"`
	RTSPPassword string             `bson:"rtspPassword" json:"rtspPassword"`
}
