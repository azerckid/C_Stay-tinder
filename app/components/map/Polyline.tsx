import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";

interface PolylineProps {
    path: google.maps.LatLngLiteral[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    showGlow?: boolean;
}

/**
 * Enhanced Polyline with "Halo/Glow" effect for better visibility on complex maps.
 * Renders a background line (outer border) and a foreground line.
 */
export function Polyline({
    path,
    strokeColor = "#00f3ff", // Neon Blue
    strokeOpacity = 1.0,
    strokeWeight = 3,
    showGlow = true,
}: PolylineProps) {
    const map = useMap();
    const [mainLine, setMainLine] = useState<google.maps.Polyline | null>(null);
    const [glowLine, setGlowLine] = useState<google.maps.Polyline | null>(null);

    // Initialize Polylines
    useEffect(() => {
        if (!map || !path || path.length === 0) return;

        // 1. Dark Glow/Background Line (더 뚜렷한 가독성 확보)
        const newGlowLine = new google.maps.Polyline({
            path,
            clickable: false,
            geodesic: true,
            strokeColor: "#0f172a", // Dark Slate (배경 지도와 대비되는 진한 색)
            strokeOpacity: 0.4,
            strokeWeight: strokeWeight + 4, // 외곽선을 충분히 굵게
            zIndex: 1,
        });

        // 2. Neon Primary Foreground Line
        const newMainLine = new google.maps.Polyline({
            path,
            clickable: false,
            geodesic: true,
            strokeColor: "#3b82f6", // 밝고 선명한 Blue
            strokeOpacity: 1.0,
            strokeWeight: strokeWeight + 1, // 메인 선도 굵게
            zIndex: 2,
        });

        if (showGlow) newGlowLine.setMap(map);
        newMainLine.setMap(map);

        setMainLine(newMainLine);
        setGlowLine(newGlowLine);

        return () => {
            newMainLine.setMap(null);
            newGlowLine.setMap(null);
        };
    }, [map, showGlow]);

    // Update path for both lines when it changes
    useEffect(() => {
        if (!path || path.length === 0) return;
        if (mainLine) mainLine.setPath(path);
        if (glowLine) glowLine.setPath(path);
    }, [mainLine, glowLine, path]);

    // Update colors and options
    useEffect(() => {
        if (!mainLine) return;
        mainLine.setOptions({
            strokeColor,
            strokeWeight,
            strokeOpacity
        });

        if (glowLine) {
            glowLine.setOptions({
                strokeWeight: strokeWeight + 3
            });
        }
    }, [mainLine, glowLine, strokeColor, strokeWeight, strokeOpacity]);

    return null;
}
