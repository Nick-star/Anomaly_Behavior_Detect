package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	controllers.InitAlertController()
	controllers.InitBuildingController()
	controllers.InitFloorController()
	controllers.InitCameraController()
	controllers.InitStreamController()

	authController := controllers.NewAuthController()
	r.POST("/auth/register", authController.Register)
	r.POST("/auth/login", authController.Login)

	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{

		cameraRoutes := api.Group("/cameras")
		{
			cameraRoutes.GET("/", controllers.GetCameras)
			cameraRoutes.POST("/", controllers.CreateCamera)
			cameraRoutes.DELETE("/:id", controllers.DeleteCamera)
		}

		alertRoutes := api.Group("/alerts")
		{
			alertRoutes.GET("/", controllers.GetAlerts)
			alertRoutes.POST("/", controllers.CreateAlert)
			alertRoutes.GET("/ws", controllers.HandleWebSocket)
		}

		buildingRoutes := api.Group("/buildings")
		{
			buildingRoutes.GET("/", controllers.GetAllBuildings)
			buildingRoutes.POST("/", controllers.CreateBuilding)
			buildingRoutes.GET("/:id", controllers.GetBuildingByID)
			buildingRoutes.PUT("/:id", controllers.UpdateBuilding)
			buildingRoutes.DELETE("/:id", controllers.DeleteBuilding)
			buildingRoutes.GET("/camera/:camera_id", controllers.GetBuildingByCameraID)
		}

		floorRoutes := api.Group("/floors")
		{
			floorRoutes.GET("/", controllers.GetAllFloors)
			floorRoutes.POST("/", controllers.CreateFloor)
			floorRoutes.GET("/:id", controllers.GetFloorByID)
			floorRoutes.PUT("/:id", controllers.UpdateFloor)
			floorRoutes.DELETE("/:id", controllers.DeleteFloor)
		}

		// Stream routes
		streamRoutes := api.Group("/stream")
		{
			streamRoutes.GET("/ws", controllers.HandleStreamWebSocket)
		}
	}

	return r
}
