"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Camera,
  Search,
  Menu,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Building, Camera as CameraType, Floor } from "@/lib/types";

interface BuildingExplorerProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  selectedCamera: CameraType | null;
  onBuildingSelect: (building: Building) => void;
  onCameraSelect: (camera: CameraType) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onBack: () => void;
  onAddBuilding: (buildingName: string) => void;
}

export function BuildingExplorer({
  buildings,
  selectedBuilding,
  selectedCamera,
  onBuildingSelect,
  onCameraSelect,
  onToggleSidebar,
  isSidebarOpen,
  onBack,
  onAddBuilding,
}: BuildingExplorerProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [newBuildingName, setNewBuildingName] = React.useState("")
  const [isAddBuildingDialogOpen, setIsAddBuildingDialogOpen] = React.useState(false)

  const filteredBuildings = React.useMemo(() => {
    if (!searchQuery) return buildings;

    return buildings
      .map((building) => {
        const buildingMatches = building.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const filteredFloors = building.floors
          .map((floor) => {
            const floorMatches = floor.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

            const filteredCameras = floor.cameras.filter(
              (camera) =>
                camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                camera.location
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            );

            return {
              ...floor,
              cameras: filteredCameras,
              matches: floorMatches || filteredCameras.length > 0,
            };
          })
          .filter((floor) => floor.matches || buildingMatches);

        return {
          ...building,
          floors: filteredFloors,
          matches: buildingMatches || filteredFloors.length > 0,
        };
      })
      .filter((building) => building.matches);
  }, [buildings, searchQuery]);

  const handleAddBuilding = () => {
    onAddBuilding(newBuildingName)
    setNewBuildingName("")
    setIsAddBuildingDialogOpen(false)
  }

  return (
    <SidebarProvider>
      <Sidebar
        className={`border-r h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-72" : "w-0"
        }`}
        collapsible="none"
      >
        <SidebarHeader className="border-b p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`text-lg font-semibold ${
                isSidebarOpen ? "opacity-100" : "opacity-0"
              } transition-opacity duration-300`}
            >
              Строения
            </div>
          </div>
        </SidebarHeader>
        <div
          className={`p-2 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          <Dialog open={isAddBuildingDialogOpen} onOpenChange={setIsAddBuildingDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mb-2">
                <Plus className="mr-2 h-4 w-4" /> Добавить строение
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить строение</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Строение
                  </Label>
                  <Input
                    id="name"
                    value={newBuildingName}
                    onChange={(e) => setNewBuildingName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleAddBuilding}>Add Building</Button>
            </DialogContent>
          </Dialog>
          <Input
            placeholder="Найти..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <SidebarContent
          className={`p-2 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          <div className="space-y-1">
            {filteredBuildings.map((building) => (
              <BuildingItem
                key={building.id}
                building={building}
                isSelected={selectedBuilding?.id === building.id}
                selectedCamera={selectedCamera}
                onBuildingSelect={onBuildingSelect}
                onCameraSelect={onCameraSelect}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            На главную
          </Button>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}

interface BuildingItemProps {
  building: Building;
  isSelected: boolean;
  selectedCamera: CameraType | null;
  onBuildingSelect: (building: Building) => void;
  onCameraSelect: (camera: CameraType) => void;
  searchQuery: string;
}

function BuildingItem({
  building,
  isSelected,
  selectedCamera,
  onBuildingSelect,
  onCameraSelect,
  searchQuery,
}: BuildingItemProps) {
  const [isOpen, setIsOpen] = React.useState(isSelected || searchQuery !== "");

  React.useEffect(() => {
    if (isSelected) {
      setIsOpen(true);
    }
  }, [isSelected]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center">
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded px-2 text-sm font-medium",
              isSelected && !selectedCamera
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onBuildingSelect(building)}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
            <Building2 className="h-5 w-5 shrink-0 text-black-500" />
            <span className="truncate">{building.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {building.floors.reduce(
                (acc, floor) => acc + floor.cameras.length,
                0
              )}
            </span>
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="ml-4 pl-4 border-l border-border">
          {building.floors.map((floor) => (
            <FloorItem
              key={floor.id}
              floor={floor}
              buildingId={building.id}
              selectedCamera={selectedCamera}
              onCameraSelect={onCameraSelect}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface FloorItemProps {
  floor: Floor;
  buildingId: string;
  selectedCamera: CameraType | null;
  onCameraSelect: (camera: CameraType) => void;
  searchQuery: string;
}

function FloorItem({
  floor,
  buildingId,
  selectedCamera,
  onCameraSelect,
  searchQuery,
}: FloorItemProps) {
  const [isOpen, setIsOpen] = React.useState(searchQuery !== "");

  const isFloorActive =
    selectedCamera &&
    selectedCamera.floorId === floor.id &&
    selectedCamera.buildingId === buildingId;

  React.useEffect(() => {
    if (isFloorActive) {
      setIsOpen(true);
    }
  }, [isFloorActive]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center">
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex h-8 w-full items-center gap-2 rounded px-2 text-sm",
              isFloorActive && !selectedCamera
                ? "bg-accent font-medium"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate">{floor.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {floor.cameras.length}
            </span>
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="space-y-1 py-1">
          {floor.cameras.map((camera) => (
            <button
              key={camera.id}
              className={cn(
                "flex h-8 w-full items-center gap-2 rounded px-2 text-sm",
                selectedCamera?.id === camera.id
                  ? "bg-accent/80 font-medium"
                  : "hover:bg-accent/50 hover:text-accent-foreground"
              )}
              onClick={() =>
                onCameraSelect({ ...camera, buildingId, floorId: floor.id })
              }
            >
              <Camera className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{camera.name}</span>
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
