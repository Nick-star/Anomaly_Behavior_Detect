"use client"

import { Camera, Grid3X3, Menu, Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  Building as BuildingType,
  Camera as CameraType,
  Floor
} from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface BuildingOverviewProps {
  building: BuildingType | null;
  onCameraSelect: (camera: CameraType) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onAddCamera: (floorId: string, cameraName: string, cameraLocation: string) => void;
}

export function BuildingOverview({
  building,
  onCameraSelect,
  onToggleSidebar,
  isSidebarOpen,
  onAddCamera,
}: BuildingOverviewProps) {
  const [isAddCameraDialogOpen, setIsAddCameraDialogOpen] = useState(false)
  const [newCameraName, setNewCameraName] = useState("")
  const [newCameraLocation, setNewCameraLocation] = useState("")
  const [selectedFloorId, setSelectedFloorId] = useState("")
  if (!building) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <Building className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">Выберите строение</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Выберите строение из боковой панели, чтобы просмотреть его камеры и исследовать систему наблюдения.
        </p>
      </div>
    );
  }

  const totalCameras = building.floors.reduce(
    (acc, floor) => acc + floor.cameras.length,
    0
  );

  const handleAddCamera = () => {
    onAddCamera(selectedFloorId, newCameraName, newCameraLocation)
    setNewCameraName("")
    setNewCameraLocation("")
    setSelectedFloorId("")
    setIsAddCameraDialogOpen(false)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b bg-background p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden md:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{building.name}</h1>
            <p className="text-sm text-muted-foreground">
              {building.address} • {building.floors.length} этажей •{" "}
              {totalCameras} камер
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="grid" className="flex-1">
      <div className="border-b bg-background px-4 flex justify-between items-center">
          <TabsList className="my-2">
            <TabsTrigger value="grid">
              <Grid3X3 className="mr-2 h-4 w-4" />
              Сетка
            </TabsTrigger>
            <TabsTrigger value="list">
              <Camera className="mr-2 h-4 w-4" />
              Список
            </TabsTrigger>
          </TabsList>
          <Dialog open={isAddCameraDialogOpen} onOpenChange={setIsAddCameraDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Добавить камеру
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить камеру</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="floor" className="text-right">
                    Этаж
                  </Label>
                  <Select onValueChange={setSelectedFloorId} value={selectedFloorId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Выбрать этаж" />
                    </SelectTrigger>
                    <SelectContent>
                      {building.floors.map((floor: Floor) => (
                        <SelectItem key={floor.id} value={floor.id}>
                          {floor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Название
                  </Label>
                  <Input
                    id="name"
                    value={newCameraName}
                    onChange={(e) => setNewCameraName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Местоположение
                  </Label>
                  <Input
                    id="location"
                    value={newCameraLocation}
                    onChange={(e) => setNewCameraLocation(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleAddCamera}>Добавить камеру</Button>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="grid" className="flex-1 overflow-auto p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {building.floors.map((floor) => (
              <div key={floor.id} className="space-y-3">
                <h3 className="text-lg font-medium">{floor.name}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {floor.cameras.map((camera) => (
                    <div
                      key={camera.id}
                      className="group cursor-pointer overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary"
                      onClick={() =>
                        onCameraSelect({
                          ...camera,
                          buildingId: building.id,
                          floorId: floor.id,
                        })
                      }
                    >
                      <div className="aspect-video bg-muted relative">
                        <img
                          src={`/placeholder.svg?height=180&width=320&text=Camera:+${camera.name}`}
                          alt={camera.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 flex h-6 items-center rounded-full bg-black/70 px-2 text-xs text-white">
                          <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></span>
                          Live
                        </div>
                      </div>
                      <div className="p-2">
                        <h4 className="font-medium group-hover:text-primary">
                          {camera.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {camera.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            {building.floors.map((floor) => (
              <div key={floor.id}>
                <h3 className="mb-2 text-lg font-medium">{floor.name}</h3>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-4 bg-muted/50 p-3 text-sm font-medium">
                    <div>Camera</div>
                    <div>Location</div>
                    <div>Status</div>
                  </div>
                  {floor.cameras.map((camera, index) => (
                    <div
                      key={camera.id}
                      className={`grid cursor-pointer grid-cols-[1fr_1fr_auto] gap-4 p-3 text-sm hover:bg-muted/50 ${
                        index !== floor.cameras.length - 1 ? "border-b" : ""
                      }`}
                      onClick={() =>
                        onCameraSelect({
                          ...camera,
                          buildingId: building.id,
                          floorId: floor.id,
                        })
                      }
                    >
                      <div className="font-medium">{camera.name}</div>
                      <div className="text-muted-foreground">
                        {camera.location}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
                        Online
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
