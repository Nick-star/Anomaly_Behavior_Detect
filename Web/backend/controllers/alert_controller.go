package controllers

import (
	"net/http"
	"strconv"
	"time"

	"backend/models"
	"backend/services"

	"github.com/gin-gonic/gin"
	"golang.org/x/net/websocket"
)

var alertService *services.AlertService

func InitAlertController() {
	alertService = services.NewAlertService()
}

func ParseFilters(c *gin.Context) (services.AlertFilter, services.AlertPagination, error) {
	var startDate, endDate time.Time
	var err error

	if startDateStr := c.Query("start_date"); startDateStr != "" {
		startDate, err = time.Parse(time.RFC3339, startDateStr)
		if err != nil {
			return services.AlertFilter{}, services.AlertPagination{}, err
		}
	}

	if endDateStr := c.Query("end_date"); endDateStr != "" {
		endDate, err = time.Parse(time.RFC3339, endDateStr)
		if err != nil {
			return services.AlertFilter{}, services.AlertPagination{}, err
		}
	}

	page, _ := strconv.ParseInt(c.Query("page"), 10, 64)
	pageSize, _ := strconv.ParseInt(c.Query("page_size"), 10, 64)
	sortDesc, _ := strconv.ParseBool(c.Query("sort_desc"))

	filter := services.AlertFilter{
		CameraID:  c.Query("camera_id"),
		Status:    c.Query("status"),
		StartDate: startDate,
		EndDate:   endDate,
	}

	pagination := services.AlertPagination{
		Page:     page,
		PageSize: pageSize,
		SortBy:   c.Query("sort_by"),
		SortDesc: sortDesc,
	}

	return filter, pagination, nil
}

func GetAlerts(c *gin.Context) {
	filter, pagination, err := ParseFilters(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный формат даты"})
		return
	}

	alerts, total, err := alertService.GetAlerts(filter, pagination)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"alerts": alerts, "total": total})
}

func CreateAlert(c *gin.Context) {
	var alert models.Alert
	if err := c.ShouldBindJSON(&alert); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createdAlert, err := alertService.CreateAlert(&alert)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdAlert)
}

func HandleWebSocket(c *gin.Context) {
	websocket.Handler(alertService.HandleWebSocket).ServeHTTP(c.Writer, c.Request)
}
