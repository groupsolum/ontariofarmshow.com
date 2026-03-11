"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@/types/event";

const FarmShowMap = dynamic(
  () =>
    import("@/components/map/farm-show-map").then((mod) => mod.FarmShowMap),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-full w-full min-h-[350px]" />
    ),
  }
);

interface MapWrapperProps {
  events: Event[];
  center?: { longitude: number; latitude: number };
  zoom?: number;
  className?: string;
  fullScreen?: boolean;
}

export function MapWrapper({ events, center, zoom, className }: MapWrapperProps) {
  return (
    <FarmShowMap
      events={events}
      center={center}
      zoom={zoom}
      className={className}
    />
  );
}
