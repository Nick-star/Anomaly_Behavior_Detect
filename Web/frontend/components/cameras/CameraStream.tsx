"use client";

import React, { useEffect, useRef, useState } from "react";
import JSMpeg from "@cycjimmy/jsmpeg-player";

type CameraStreamProps = {
  cameraId: string;
  width?: number;
  height?: number;
};

const CameraStream = ({ cameraId, width = 640, height = 480 }: CameraStreamProps) => {
  const { token } = useAuth();
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cameraId || !videoRef.current || !token) return;

    // Clean up any existing player
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    setLoading(true);
    setError(null);

    // Create WebSocket URL with authentication token
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/stream/ws?cameraId=${cameraId}`;

    try {
      // Create new player
      playerRef.current = new JSMpeg.Player(wsUrl, {
        canvas: videoRef.current,
        audio: false,
        videoBufferSize: 1024 * 1024, // 1MB buffer
        preserveDrawingBuffer: true,
        onPlay: () => {
          setLoading(false);
        },
        onStalled: () => {
          setError("Видеопоток приостановлен. Переподключение...");
        },
        protocols: {
          websocket: {
            // Add token to WebSocket connection
            options: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          },
        },
      });
    } catch (err) {
      console.error("Error initializing video player:", err);
      setError("Ошибка инициализации видеоплеера");
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [cameraId, token]);

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
          <div className="text-red-500 text-sm p-2 bg-gray-800 rounded-md">{error}</div>
        </div>
      )}

      <div 
        ref={videoRef} 
        style={{ width: `${width}px`, height: `${height}px` }}
        className="bg-black"
      />
    </div>
  );
};

export default CameraStream; 
