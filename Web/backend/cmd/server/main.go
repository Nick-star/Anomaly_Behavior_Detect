package main

import (
	"fmt"
	"log"

	"backend/bootstrap"
	"backend/config"
	"backend/routes"
)

func main() {
	config.ConnectDatabase()
	bootstrap.InitializeApp()

	r := routes.SetupRouter()
	port := "8080"
	fmt.Println("🚀 Server running on port", port)
	log.Fatal(r.Run(":" + port))
}
