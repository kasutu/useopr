import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Waypoint } from "@/types/opr";
import { MapSearch } from "./MapSearch";
import { GeocodingResult } from "@/utils/geocoding";

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
  onMapCenterChange?: (lat: number, lng: number) => void;
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
  onMapCenterChange,
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

    map.current.on("move", () => {
      if (map.current && onMapCenterChange) {
        const center = map.current.getCenter();
        onMapCenterChange(center.lat, center.lng);
      }
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

  // Navigate to selected waypoint
  useEffect(() => {
    if (map.current && isMapReady && selectedWaypointIndex !== null && waypoints[selectedWaypointIndex]) {
      const waypoint = waypoints[selectedWaypointIndex];
      map.current.flyTo({
        center: [waypoint.longitude, waypoint.latitude],
        zoom: 16,
        duration: 1000,
      });
    }
  }, [selectedWaypointIndex, isMapReady]);

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

  // Waypoint markers and route line
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Remove existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Fetch and update route using Mapbox Directions API
    const fetchRoute = async () => {
      if (waypoints.length < 2) {
        // If less than 2 waypoints, remove the route
        if (map.current?.getSource('route')) {
          (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          });
        }
        return;
      }

      const coordinates = waypoints.map(wp => `${wp.longitude},${wp.latitude}`).join(';');
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const routeGeometry = data.routes[0].geometry;

          if (map.current?.getSource('route')) {
            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: routeGeometry
            });
          } else {
            map.current?.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: routeGeometry
              }
            });

            map.current?.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#10b981',
                'line-width': 4,
                'line-opacity': 0.8
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();

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

  const handleSearchResultClick = (result: GeocodingResult) => {
    if (map.current) {
      map.current.flyTo({
        center: result.center,
        zoom: 16,
        duration: 1500,
      });
    }
  };

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <p className="text-muted-foreground">Please set your Mapbox API key in settings</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
      <MapSearch
        apiKey={apiKey}
        proximity={{ lat: centerLat, lng: centerLng }}
        onResultClick={handleSearchResultClick}
      />
    </div>
  );
};
