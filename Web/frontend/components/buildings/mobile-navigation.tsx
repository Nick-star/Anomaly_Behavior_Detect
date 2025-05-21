"use client";

import type { Building, Camera } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Building2, CameraIcon, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  selectedCamera: Camera | null;
  onBuildingSelect: (building: Building) => void;
  onCameraSelect: (camera: Camera) => void;
  onBack: () => void;
}

export function MobileNavigation({
  buildings,
  selectedBuilding,
  selectedCamera,
  onBuildingSelect,
  onCameraSelect,
  onBack,
}: MobileNavigationProps) {
  const [open, setOpen] = useState(false);

  const handleBuildingSelect = (building: Building) => {
    onBuildingSelect(building);
    setOpen(false);
  };

  const handleCameraSelect = (camera: Camera) => {
    onCameraSelect(camera);
    setOpen(false);
  };

  return (
    <div className="border-b bg-background p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Building Camera Explorer</h1>
            <p className="text-sm text-muted-foreground">
              {selectedBuilding ? selectedBuilding.name : "Select a building"}
              {selectedCamera ? ` • ${selectedCamera.name}` : ""}
            </p>
          </div>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle>Buildings</SheetTitle>
            </SheetHeader>
            <div className="overflow-auto">
              {buildings.map((building) => (
                <div key={building.id} className="border-b">
                  <button
                    className={cn(
                      "flex w-full items-center gap-2 p-3 text-left",
                      selectedBuilding?.id === building.id && "bg-accent"
                    )}
                    onClick={() => handleBuildingSelect(building)}
                  >
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{building.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {building.floors.reduce(
                          (acc, floor) => acc + floor.cameras.length,
                          0
                        )}{" "}
                        cameras
                      </div>
                    </div>
                  </button>

                  {selectedBuilding?.id === building.id && (
                    <div className="border-t bg-muted/30">
                      {building.floors.map((floor) => (
                        <div
                          key={floor.id}
                          className="border-b border-border/50 px-3 py-2"
                        >
                          <div className="font-medium text-sm">
                            {floor.name}
                          </div>
                          <div className="mt-1 space-y-1">
                            {floor.cameras.map((camera) => (
                              <button
                                key={camera.id}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm",
                                  selectedCamera?.id === camera.id &&
                                    "bg-accent"
                                )}
                                onClick={() =>
                                  handleCameraSelect({
                                    ...camera,
                                    buildingId: building.id,
                                    floorId: floor.id,
                                  })
                                }
                              >
                                <CameraIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="truncate">{camera.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
