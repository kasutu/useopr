import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Waypoint } from "@/types/opr";

interface MapViewProps {
  apiKey: string;
  centerLat: number;
  centerLng: number;
  waypoints: Waypoint[];
  selectedWaypointIndex: number | null;
  onWaypointMove: (index: number, lat: number, lng: number) => void;
  onWaypointSelect: (index: number | null) => void;
  onCityMove?: (lat: number, lng: number) => void;
  showCityMarker?: boolean;
}

export const MapView = ({
  apiKey,
  centerLat,
  centerLng,
  waypoints,
  selectedWaypointIndex,
  onWaypointMove,
  onWaypointSelect,
  onCityMove,
  showCityMarker = false,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const cityMarker = useRef<mapboxgl.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !apiKey || map.current) return;

    mapboxgl.accessToken = apiKey;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [centerLng, centerLat],
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setIsMapReady(true);
    });

    return () => {
      markers.current.forEach((marker) => marker.remove());
      cityMarker.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, [apiKey]);

  // Update map center
  useEffect(() => {
    if (map.current && isMapReady) {
      map.current.flyTo({
        center: [centerLng, centerLat],
        zoom: 13,
      });
    }
  }, [centerLat, centerLng, isMapReady]);

  // City marker
  useEffect(() => {
    if (!map.current || !isMapReady || !showCityMarker) {
      cityMarker.current?.remove();
      cityMarker.current = null;
      return;
    }

    if (cityMarker.current) {
      cityMarker.current.setLngLat([centerLng, centerLat]);
    } else {
      const el = document.createElement("div");
      el.className = "city-marker";
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.backgroundColor = "#ef4444";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid white";
      el.style.cursor = "move";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

      cityMarker.current = new mapboxgl.Marker({
        element: el,
        draggable: true,
      })
        .setLngLat([centerLng, centerLat])
        .addTo(map.current);

      cityMarker.current.on("dragend", () => {
        const lngLat = cityMarker.current!.getLngLat();
        onCityMove?.(lngLat.lat, lngLat.lng);
      });
    }
  }, [showCityMarker, centerLat, centerLng, isMapReady, onCityMove]);

  // Waypoint markers
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Remove existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers
    waypoints.forEach((waypoint, index) => {
      const el = document.createElement("div");
      el.className = "waypoint-marker";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.backgroundColor =
        index === selectedWaypointIndex ? "#3b82f6" : "#10b981";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid white";
      el.style.cursor = "move";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.color = "white";
      el.style.fontWeight = "bold";
      el.style.fontSize = "14px";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
      el.textContent = waypoint.sequence.toString();

      el.addEventListener("click", () => {
        onWaypointSelect(index);
      });

      const marker = new mapboxgl.Marker({
        element: el,
        draggable: true,
      })
        .setLngLat([waypoint.longitude, waypoint.latitude])
        .addTo(map.current!);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        onWaypointMove(index, lngLat.lat, lngLat.lng);
      });

      markers.current.push(marker);
    });
  }, [waypoints, selectedWaypointIndex, isMapReady, onWaypointMove, onWaypointSelect]);

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <p className="text-muted-foreground">Please set your Mapbox API key in settings</p>
      </div>
    );
  }

  return <div ref={mapContainer} className="h-full w-full" />;
};
