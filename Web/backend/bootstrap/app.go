package bootstrap

import (
	"backend/controllers"
)

func InitializeApp() {
	initControllers()
}

func initControllers() {
	controllers.InitCameraController()
}
