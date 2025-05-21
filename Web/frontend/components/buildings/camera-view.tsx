"use client";

import { ArrowLeft, Maximize2, Menu, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Building, Camera } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface CameraViewProps {
  camera: Camera;
  building: Building;
  onBack: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function CameraView({
  camera,
  building,
  onBack,
  onToggleSidebar,
  isSidebarOpen,
}: CameraViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const floor = building.floors.find((f) => f.id === camera.floorId);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  return (
    <div className="flex h-full flex-col relative z-10">
      <header className="flex items-center justify-between border-b bg-background p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden md:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{camera.name}</h1>
            <p className="text-sm text-muted-foreground">
              {building.name} • {floor?.name} • {camera.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Maximize2 className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50">
              <DropdownMenuItem>Download snapshot</DropdownMenuItem>
              <DropdownMenuItem>Share camera view</DropdownMenuItem>
              <DropdownMenuItem>Camera settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            alt={`Camera feed from ${camera.name}`}
            className="h-full w-full object-contain"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{camera.name}</p>
              <p className="text-sm opacity-80">{camera.location}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Live</p>
              <p className="text-xs opacity-80">1080p • 30fps</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-background p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Camera Details</h3>
            <dl className="mt-2 grid grid-cols-2 gap-1 text-sm">
              <dt className="text-muted-foreground">Type:</dt>
              <dd>{camera.type}</dd>
              <dt className="text-muted-foreground">Resolution:</dt>
              <dd>1080p</dd>
              <dt className="text-muted-foreground">Status:</dt>
              <dd className="flex items-center">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
                Online
              </dd>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-medium">Location</h3>
            <dl className="mt-2 grid grid-cols-2 gap-1 text-sm">
              <dt className="text-muted-foreground">Building:</dt>
              <dd>{building.name}</dd>
              <dt className="text-muted-foreground">Floor:</dt>
              <dd>{floor?.name}</dd>
              <dt className="text-muted-foreground">Area:</dt>
              <dd>{camera.location}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
