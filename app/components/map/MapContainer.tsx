import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const DARK_MAP_STYLE = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
];

interface MapContainerProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    mapId?: string;
    className?: string;
    children?: React.ReactNode;
}

export function MapContainer({ center, zoom = 10, mapId, className, children }: MapContainerProps) {
    // Center default to Seoul if not provided
    const defaultCenter = { lat: 37.5665, lng: 126.9780 };

    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div className={`w-full h-full ${className}`}>
                <Map
                    defaultCenter={center || defaultCenter}
                    defaultZoom={zoom}
                    mapId={mapId || "DEMO_MAP_ID"} // AdvancedMarker requires a Map ID
                    gestureHandling={"greedy"}
                    disableDefaultUI={true}
                    styles={DARK_MAP_STYLE}
                    className="w-full h-full"
                >
                    {children}
                </Map>
            </div>
        </APIProvider>
    );
}
