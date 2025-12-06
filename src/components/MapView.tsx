import React, { useEffect, useRef } from "react";
import { Spot, Route } from "../types";
import { getStaticMapImage } from "../services/geminiService";
import L from "leaflet";

// Use CDN URLs to avoid module resolution issues
const markerIcon2x =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const markerIcon =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const markerShadow =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapViewProps {
  routes: Route[];
  onSelectSpot: (spot: Spot | null) => void;
  activeSpotId: string | null;
}

const MapView: React.FC<MapViewProps> = ({
  routes,
  onSelectSpot,
  activeSpotId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Use the reliable map image from service
  const mapUrl = getStaticMapImage("map_view");

  // Helper to find category color
  const getSpotColorClass = (spotId: string) => {
    let category = "";
    for (const route of routes) {
      if (route.spots.some((s) => s.id === spotId)) {
        category = route.category;
        break;
      }
    }

    switch (category) {
      case "历史文化":
        return "bg-red-500 border-red-600";
      case "自然风景":
        return "bg-green-500 border-green-600";
      case "美食体验":
        return "bg-amber-500 border-amber-600";
      default:
        return "bg-blue-500 border-blue-600";
    }
  };

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Define the bounds of our "Image World" (1000x1000 units)
      const bounds = new L.LatLngBounds([0, 0], [1000, 1000]);

      const mapInst = L.map(mapContainerRef.current, {
        crs: L.CRS.Simple, // Coordinate Reference System for flat images
        minZoom: -1, // Allow zooming out to see full map
        maxZoom: 2, // Allow zooming in for details
        zoomControl: false, // We'll add custom controls if needed, or rely on gestures
        attributionControl: false,
        maxBounds: bounds.pad(0.2), // Restrict panning slightly beyond image
      });

      // Add the static image as the map base
      L.imageOverlay(mapUrl, bounds).addTo(mapInst);

      // Fit the map to the image initially
      mapInst.fitBounds(bounds);

      // Create a layer group for markers to easily clear/update them
      const layers = L.layerGroup().addTo(mapInst);
      markersLayerRef.current = layers;
      mapInstanceRef.current = mapInst;
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [mapUrl]);

  // Update Markers when activeSpotId or routes change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    const spots = routes.flatMap((r) => r.spots);

    spots.forEach((spot) => {
      // Convert CSS % position to Leaflet Coordinate System (1000x1000)
      // Top 0% = Y 1000, Top 100% = Y 0
      // Left 0% = X 0, Left 100% = X 1000
      const y = 1000 - parseFloat(spot.position.top) * 10;
      const x = parseFloat(spot.position.left) * 10;

      const isActive = activeSpotId === spot.id;
      const colorClass = getSpotColorClass(spot.id);

      // Construct Custom HTML Icon
      // Using Tailwind classes directly in the HTML string
      const iconHtml = `
            <div class="relative flex flex-col items-center justify-center transition-all duration-500 ${
              isActive ? "scale-125 z-50" : "hover:scale-110 z-10"
            }">
                ${
                  isActive
                    ? `<div class="absolute w-full h-full rounded-full ${
                        colorClass.split(" ")[0]
                      } opacity-40 animate-ping" style="width: 200%; height: 200%;"></div>`
                    : ""
                }
                
                <div class="relative w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center ${colorClass}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 text-white">
                        <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                    </svg>
                </div>
                
                <span class="mt-1 px-1.5 py-0.5 bg-white/90 backdrop-blur rounded text-[9px] font-bold text-gray-700 shadow-sm border border-gray-100 whitespace-nowrap ${
                  isActive ? "bg-white text-black ring-1 ring-teal-500" : ""
                }">
                    ${spot.name}
                </span>
            </div>
        `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "bg-transparent", // Remove default Leaflet square background
        iconSize: [40, 40],
        iconAnchor: [20, 20], // Center it
      });

      const m = L.marker([y, x], { icon: customIcon });

      // Bind Tooltip (Hover effect)
      m.bindTooltip(spot.name, {
        direction: "top",
        offset: [0, -10],
        opacity: 0.9,
        className: "font-brand font-bold text-xs px-2 py-1",
      });

      // Click Handler
      m.on("click", () => {
        onSelectSpot(spot);
        // Pan to spot
        mapInstanceRef.current?.setView([y, x], 1);
      });

      // If active, open tooltip programmatically? Or just rely on visual feedback.
      // Let's pan to it if active
      if (isActive && mapInstanceRef.current) {
        mapInstanceRef.current.setView([y, x], 1, { animate: true });
      }

      m.addTo(layerGroup);
    });
  }, [routes, activeSpotId, mapUrl]);

  return (
    <div className="relative w-full h-full bg-stone-100 overflow-hidden">
      {/* Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 outline-none" />

      {/* Back Button Overlay */}
      {activeSpotId && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectSpot(null);
          }}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur text-teal-700 px-4 py-2 rounded-full text-xs font-bold shadow-premium-lg z-[400] hover:bg-teal-50 transition-all flex items-center space-x-2 border border-teal-100 animate-fade-in"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          <span>返回列表</span>
        </button>
      )}
    </div>
  );
};

export default MapView;
