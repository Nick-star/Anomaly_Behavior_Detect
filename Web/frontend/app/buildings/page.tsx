"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BuildingExplorer } from "@/components/buildings/building-explorer";
import { CameraView } from "@/components/buildings/camera-view";
import { BuildingOverview } from "@/components/buildings/building-overview";
import { MobileNavigation } from "@/components/buildings/mobile-navigation";
import type { Building, Camera } from "@/lib/types";
import { buildings as initialBuildings } from "@/lib/data";

export default function BuildingsPage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings)
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    setSelectedCamera(null);
  };

  const handleCameraSelect = (camera: Camera) => {
    setSelectedCamera(camera);
  };

  const handleAddBuilding = (buildingName: string) => {
    const newBuilding: Building = {
      id: `b${buildings.length + 1}`,
      name: buildingName,
      address: "New Building Address",
      floors: [],
    }
    setBuildings([...buildings, newBuilding])
  }

  const handleAddCamera = (floorId: string, cameraName: string, cameraLocation: string) => {
    if (!selectedBuilding) return

    const updatedBuildings = buildings.map((building) => {
      if (building.id === selectedBuilding.id) {
        const updatedFloors = building.floors.map((floor) => {
          if (floor.id === floorId) {
            const newCamera: Camera = {
              id: `${floor.id}-c${floor.cameras.length + 1}`,
              name: cameraName,
              type: "Fixed Camera",
              location: cameraLocation,
              buildingId: building.id,
              floorId: floor.id,
            }
            return { ...floor, cameras: [...floor.cameras, newCamera] }
          }
          return floor
        })
        return { ...building, floors: updatedFloors }
      }
      return building
    })

    setBuildings(updatedBuildings)
    setSelectedBuilding(updatedBuildings.find((b) => b.id === selectedBuilding.id) || null)
  }

  const handleBack = () => {
    setSelectedBuilding(null);
    router.push("/");
  };

  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      <div className="md:hidden">
        <MobileNavigation
          buildings={buildings}
          selectedBuilding={selectedBuilding}
          selectedCamera={selectedCamera}
          onBuildingSelect={handleBuildingSelect}
          onCameraSelect={handleCameraSelect}
          onBack={handleBack}
        />
      </div>
      <div className={`hidden md:block ${isSidebarOpen ? "w-72" : "w-0"}`}>
        <BuildingExplorer
          buildings={buildings}
          selectedBuilding={selectedBuilding}
          selectedCamera={selectedCamera}
          onBuildingSelect={handleBuildingSelect}
          onCameraSelect={handleCameraSelect}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onBack={handleBack}
          onAddBuilding={handleAddBuilding}
        />
      </div>
      <main className="flex-1 overflow-auto bg-muted/30">
        {selectedCamera ? (
          <CameraView
            camera={selectedCamera}
            building={selectedBuilding!}
            onBack={() => setSelectedCamera(null)}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        ) : (
          <BuildingOverview
            building={selectedBuilding}
            onCameraSelect={handleCameraSelect}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            onAddCamera={handleAddCamera}
          />
        )}
      </main>
    </div>
  );
}
