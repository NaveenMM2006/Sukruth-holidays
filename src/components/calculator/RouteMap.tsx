"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Place, RouteResult } from "@/lib/routing";

type Props = {
  start: Place | null;
  end: Place | null;
  route: RouteResult | null;
};

export default function RouteMap({ start, end, route }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamically import Leaflet on client side
    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !containerRef.current) return;

      // Initialize map centered in Karnataka / South India
      const map = L.map(containerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 7,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = { map, L };

      // Trigger initial render
      updateMapElements();
    });

    return () => {
      isMounted = false;
      if (mapRef.current?.map) {
        mapRef.current.map.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers and route whenever props change
  useEffect(() => {
    updateMapElements();
  }, [start, end, route]);

  function updateMapElements() {
    if (!mapRef.current) return;
    const { map, L } = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Clear old polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const bounds: [number, number][] = [];

    // Start / Pickup marker (Green Pin)
    if (start) {
      const startIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="background-color: #059669; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
            <span style="transform: rotate(45deg); font-weight: bold; font-size: 13px;">A</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const startMarker = L.marker([start.lat, start.lon], { icon: startIcon })
        .addTo(map)
        .bindPopup(`<strong>Pickup:</strong> ${start.name}<br/><span style="font-size:11px;color:#666;">${start.label}</span>`);

      markersRef.current.push(startMarker);
      bounds.push([start.lat, start.lon]);
    }

    // End / Destination marker (Red Pin)
    if (end) {
      const endIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="background-color: #DC2626; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
            <span style="transform: rotate(45deg); font-weight: bold; font-size: 13px;">B</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      const endMarker = L.marker([end.lat, end.lon], { icon: endIcon })
        .addTo(map)
        .bindPopup(`<strong>Drop-off:</strong> ${end.name}<br/><span style="font-size:11px;color:#666;">${end.label}</span>`);

      markersRef.current.push(endMarker);
      bounds.push([end.lat, end.lon]);
    }

    // Draw driving polyline route
    if (route && route.coordinates.length > 0) {
      // Glow/Border layer for road
      const borderLine = L.polyline(route.coordinates, {
        color: "#ffffff",
        weight: 8,
        opacity: 0.9,
      }).addTo(map);

      // Main driving route line
      const mainLine = L.polyline(route.coordinates, {
        color: "#0C2B3D",
        weight: 5,
        opacity: 0.95,
      }).addTo(map);

      polylineRef.current = L.layerGroup([borderLine, mainLine]).addTo(map);

      map.fitBounds(mainLine.getBounds(), { padding: [50, 50], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 11);
    } else if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 13 });
    }
  }

  return (
    <div className="relative isolate z-0 h-full min-h-[380px] w-full overflow-hidden rounded-3xl bg-mist shadow-card">
      <div ref={containerRef} className="h-full w-full min-h-[380px]" />
      {!start && !end && (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[400] rounded-xl bg-white/90 p-3 text-center text-xs text-ink/70 backdrop-blur-sm sm:left-auto sm:right-4 sm:max-w-xs">
          Select pickup & drop points to view the real road driving route.
        </div>
      )}
    </div>
  );
}

