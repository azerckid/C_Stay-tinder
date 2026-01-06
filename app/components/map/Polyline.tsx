import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";

interface PolylineProps {
    path: google.maps.LatLngLiteral[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
}

export function Polyline({
    path,
    strokeColor = "#25aff4", // Primary color from design system
    strokeOpacity = 1.0,
    strokeWeight = 4,
}: PolylineProps) {
    const map = useMap();
    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

    // Initialize Polyline
    useEffect(() => {
        if (!map || !path || path.length === 0) return;

        // Google Maps Polyline with Dashed Line (using SVG Path)
        // 'M 0,-1 0,1' creates a simple line segment, avoiding SymbolPath constants dependence
        const lineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 4,
        };

        const newPolyline = new google.maps.Polyline({
            path,
            clickable: false,
            geodesic: true,
            strokeColor,
            strokeOpacity: 0, // Main line is transparent
            strokeWeight: 0,
            icons: [
                {
                    icon: lineSymbol,
                    offset: "0",
                    repeat: "20px", // Gap between dashes
                },
            ],
        });

        newPolyline.setMap(map);
        setPolyline(newPolyline);

        return () => {
            if (newPolyline) {
                newPolyline.setMap(null);
            }
        };
    }, [map, strokeColor]); // path는 별도 useEffect에서 처리

    // Update path when it changes
    useEffect(() => {
        if (!polyline || !path || path.length === 0) return;

        polyline.setPath(path);
    }, [polyline, path]);

    // Update stroke options when they change
    useEffect(() => {
        if (!polyline) return;

        // Use the same line symbol as initialization
        const lineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 4,
        };

        polyline.setOptions({
            strokeColor,
            strokeOpacity: 0, // Main line transparent
            strokeWeight: 0,
            icons: [
                {
                    icon: lineSymbol,
                    offset: "0",
                    repeat: "20px",
                },
            ],
        });
    }, [polyline, strokeColor]);

    return null;
}
