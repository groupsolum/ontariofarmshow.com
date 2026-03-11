"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  type MapRef,
  type MapMouseEvent,
} from "react-map-gl/mapbox";
import type { LayerProps } from "react-map-gl/mapbox";
import type { GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MAPBOX_TOKEN, MAP_STYLE, ONTARIO_CENTER, ONTARIO_DEFAULT_ZOOM } from "@/lib/mapbox";
import type { Event, EventGeoJSON, EventFeature } from "@/types/event";

interface FarmShowMapProps {
  events: Event[];
  center?: { longitude: number; latitude: number };
  zoom?: number;
  className?: string;
}

function eventsToGeoJSON(events: Event[]): EventGeoJSON {
  return {
    type: "FeatureCollection",
    features: events
      .filter((e) => e.latitude && e.longitude)
      .map<EventFeature>((e) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [e.longitude, e.latitude],
        },
        properties: {
          id: e.id,
          slug: e.slug,
          title: e.title,
          city: e.city,
          start_date: e.start_date,
          end_date: e.end_date,
          venue_type: e.venue_type,
          event_type: e.event_type,
          is_free: e.is_free,
          adult_price: e.adult_price,
          thumbnail_url: e.thumbnail_url,
        },
      })),
  };
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = new Date(startDate + "T00:00:00");
  if (!endDate || endDate === startDate) {
    return format(start, "MMM d, yyyy");
  }
  const end = new Date(endDate + "T00:00:00");
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`;
  }
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
}

const clusterLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  source: "events",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#16a34a",
    "circle-radius": [
      "step",
      ["get", "point_count"],
      18,   // radius 18 for count < 10
      10,
      24,   // radius 24 for count < 50
      50,
      32,   // radius 32 for count >= 50
    ],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
    "circle-opacity": 0.9,
  },
};

const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  source: "events",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 13,
    "text-allow-overlap": true,
  },
  paint: {
    "text-color": "#ffffff",
  },
};

const unclusteredPointLayer: LayerProps = {
  id: "unclustered-point",
  type: "circle",
  source: "events",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "hsl(var(--primary))",
    "circle-radius": 8,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
    "circle-opacity": 0.9,
  },
};

interface PopupInfo {
  longitude: number;
  latitude: number;
  title: string;
  slug: string;
  city: string;
  start_date: string;
  end_date: string | null;
  is_free: boolean;
  adult_price: number | null;
}

export function FarmShowMap({
  events,
  center,
  zoom,
  className,
}: FarmShowMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  const geojson = useMemo(() => eventsToGeoJSON(events), [events]);

  const initialViewState = useMemo(
    () => ({
      longitude: center?.longitude ?? ONTARIO_CENTER.longitude,
      latitude: center?.latitude ?? ONTARIO_CENTER.latitude,
      zoom: zoom ?? ONTARIO_DEFAULT_ZOOM,
    }),
    [center, zoom]
  );

  const onClick = useCallback(
    (e: MapMouseEvent) => {
      const map = mapRef.current;
      if (!map) return;

      const features = e.features;
      if (!features || features.length === 0) {
        setPopupInfo(null);
        return;
      }

      const feature = features[0];

      // Clicked on a cluster
      if (feature.layer?.id === "clusters") {
        const clusterId = feature.properties?.cluster_id;
        if (clusterId == null) return;

        const source = map.getSource("events") as GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, expansionZoom) => {
          if (err) return;
          const geometry = feature.geometry;
          if (geometry.type !== "Point") return;

          map.easeTo({
            center: [geometry.coordinates[0], geometry.coordinates[1]],
            zoom: Math.min(expansionZoom ?? 14, 16),
            duration: 500,
          });
        });
        return;
      }

      // Clicked on an unclustered point
      if (feature.layer?.id === "unclustered-point") {
        const geometry = feature.geometry;
        if (geometry.type !== "Point") return;

        const props = feature.properties;
        if (!props) return;

        setPopupInfo({
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
          title: props.title,
          slug: props.slug,
          city: props.city,
          start_date: props.start_date,
          end_date: props.end_date ?? null,
          is_free: props.is_free === true || props.is_free === "true",
          adult_price: props.adult_price ? Number(props.adult_price) : null,
        });
      }
    },
    []
  );

  const onMouseEnter = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      map.getCanvas().style.cursor = "pointer";
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      map.getCanvas().style.cursor = "";
    }
  }, []);

  const interactiveLayerIds = useMemo(
    () => ["clusters", "unclustered-point"],
    []
  );

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg", className)}>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        interactiveLayerIds={interactiveLayerIds}
        maxZoom={16}
        minZoom={4}
      >
        <NavigationControl position="top-right" showCompass={false} />

        <Source
          id="events"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            className="farm-show-popup"
            maxWidth="280px"
          >
            <div className="p-1">
              <h3 className="mb-1 text-sm font-semibold leading-tight">
                {popupInfo.title}
              </h3>
              <p className="mb-1 text-xs text-muted-foreground">
                {popupInfo.city}
              </p>
              <p className="mb-2 text-xs text-muted-foreground">
                {formatDateRange(popupInfo.start_date, popupInfo.end_date)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary">
                  {popupInfo.is_free
                    ? "Free"
                    : popupInfo.adult_price
                      ? `$${popupInfo.adult_price}`
                      : "See website"}
                </span>
                <Link
                  href={`/farm-shows/${popupInfo.slug}`}
                  className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  View Details
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
