package controllers

import (
	"net/http"

	"backend/models"
	"backend/services"

	"github.com/gin-gonic/gin"
)

var buildingService *services.BuildingService

func InitBuildingController() {
	buildingService = services.NewBuildingService()
}

func GetAllBuildings(c *gin.Context) {
	buildings, err := buildingService.GetAllBuildings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, buildings)
}

func CreateBuilding(c *gin.Context) {
	var building models.Building
	if err := c.ShouldBindJSON(&building); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createdBuilding, err := buildingService.CreateBuilding(&building)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdBuilding)
}

func GetBuildingByID(c *gin.Context) {
	id := c.Param("id")
	building, err := buildingService.GetBuildingByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, building)
}

func UpdateBuilding(c *gin.Context) {
	id := c.Param("id")
	var building models.Building
	if err := c.ShouldBindJSON(&building); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedBuilding, err := buildingService.UpdateBuilding(id, &building)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedBuilding)
}

func DeleteBuilding(c *gin.Context) {
	id := c.Param("id")
	err := buildingService.DeleteBuilding(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "здание успешно удалено"})
}

func GetBuildingByCameraID(c *gin.Context) {
	cameraID := c.Param("camera_id")
	building, err := buildingService.GetBuildingByCameraID(cameraID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, building)
}
