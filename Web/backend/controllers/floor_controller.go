package controllers

import (
	"net/http"

	"backend/models"
	"backend/services"

	"github.com/gin-gonic/gin"
)

var floorService *services.FloorService

func InitFloorController() {
	floorService = services.NewFloorService()
}

func GetAllFloors(c *gin.Context) {
	floors, err := floorService.GetAllFloors()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, floors)
}

func CreateFloor(c *gin.Context) {
	var floor models.Floor
	if err := c.ShouldBindJSON(&floor); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createdFloor, err := floorService.CreateFloor(&floor)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdFloor)
}

func GetFloorByID(c *gin.Context) {
	id := c.Param("id")
	floor, err := floorService.GetFloorByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, floor)
}

func UpdateFloor(c *gin.Context) {
	id := c.Param("id")
	var floor models.Floor
	if err := c.ShouldBindJSON(&floor); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedFloor, err := floorService.UpdateFloor(id, &floor)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedFloor)
}

func DeleteFloor(c *gin.Context) {
	id := c.Param("id")
	err := floorService.DeleteFloor(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "этаж успешно удален"})
}
