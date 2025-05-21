package services_test

import (
	"backend/models"
	"backend/services"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/integration/mtest"
)

func TestGetAllCameras(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))
	defer mt.Client.Disconnect(nil)

	mt.Run("success", func(mt *mtest.T) {

		camera1ID := primitive.NewObjectID()
		camera2ID := primitive.NewObjectID()

		first := mtest.CreateCursorResponse(1, "foo.bar", mtest.FirstBatch, bson.D{
			{"_id", camera1ID},
			{"name", "Camera 1"},
			{"type", "CCTV"},
			{"status", "Active"},
		})
		second := mtest.CreateCursorResponse(1, "foo.bar", mtest.NextBatch, bson.D{
			{"_id", camera2ID},
			{"name", "Camera 2"},
			{"type", "IP"},
			{"status", "Active"},
		})
		killCursors := mtest.CreateCursorResponse(0, "foo.bar", mtest.NextBatch)

		mt.AddMockResponses(first, second, killCursors)

		service := services.CameraService{Collection: mt.Coll}
		cameras, err := service.GetAllCameras()

		assert.Nil(t, err)
		assert.Equal(t, 2, len(cameras))
		assert.Equal(t, "Camera 1", cameras[0].Name)
		assert.Equal(t, "Camera 2", cameras[1].Name)
	})

	mt.Run("database error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11600,
			Message: "Database error",
		}))

		service := services.CameraService{Collection: mt.Coll}
		cameras, err := service.GetAllCameras()

		assert.NotNil(t, err)
		assert.Nil(t, cameras)
	})
}

func TestCreateCamera(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))
	defer mt.Client.Disconnect(nil)

	mt.Run("success", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		service := services.CameraService{Collection: mt.Coll}
		camera := &models.Camera{
			Name:     "Test Camera",
			Type:     models.CameraTypeCCTV,
			Status:   models.CameraStatusActive,
			Location: "Test Location",
		}

		result, err := service.CreateCamera(camera)

		assert.Nil(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "Test Camera", result.Name)
	})

	mt.Run("database error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "Duplicate key error",
		}))

		service := services.CameraService{Collection: mt.Coll}
		camera := &models.Camera{
			Name:   "Test Camera",
			Type:   models.CameraTypeCCTV,
			Status: models.CameraStatusActive,
		}

		result, err := service.CreateCamera(camera)

		assert.NotNil(t, err)
		assert.Nil(t, result)
	})
}

func TestDeleteCamera(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))
	defer mt.Client.Disconnect(nil)

	mt.Run("success", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		service := services.CameraService{Collection: mt.Coll}
		err := service.DeleteCamera(primitive.NewObjectID().Hex())

		assert.Nil(t, err)
	})

	mt.Run("invalid id", func(mt *mtest.T) {
		service := services.CameraService{Collection: mt.Coll}
		err := service.DeleteCamera("invalid-id")

		assert.NotNil(t, err)
		assert.Contains(t, err.Error(), "некорректный ID камеры")
	})

	mt.Run("database error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "Database error",
		}))

		service := services.CameraService{Collection: mt.Coll}
		err := service.DeleteCamera(primitive.NewObjectID().Hex())

		assert.NotNil(t, err)
	})
}
