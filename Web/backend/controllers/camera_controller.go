package controllers

import (
	"net/http"

	"backend/models"
	"backend/services"

	"github.com/gin-gonic/gin"
)

var cameraService *services.CameraService

func InitCameraController() {
	cameraService = services.NewCameraService()
}

func GetCameras(c *gin.Context) {
	cameras, err := cameraService.GetAllCameras()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении списка камер"})
		return
	}
	c.JSON(http.StatusOK, cameras)
}

func CreateCamera(c *gin.Context) {
	var camera models.Camera
	if err := c.ShouldBindJSON(&camera); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный JSON"})
		return
	}

	createdCamera, err := cameraService.CreateCamera(&camera)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при создании камеры"})
		return
	}

	c.JSON(http.StatusCreated, createdCamera)
}

func DeleteCamera(c *gin.Context) {
	id := c.Param("id")
	err := cameraService.DeleteCamera(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Камера удалена"})
}
