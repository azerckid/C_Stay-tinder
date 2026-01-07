import { useEffect, useRef } from "react";
import { useKakaoMap } from "./MapContext";

interface KakaoPolylineProps {
    path: { lat: number; lng: number }[];
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    showGlow?: boolean;
}

/**
 * Enhanced Kakao Polyline with "Halo/Glow" effect to match Google Polyline design.
 */
export function KakaoPolyline({
    path,
    strokeColor = "#00f3ff",
    strokeWeight = 2,
    strokeOpacity = 1,
    showGlow = true,
}: KakaoPolylineProps) {
    const kakaoMapContext = useKakaoMap();
    const map = kakaoMapContext?.map;

    const mainLineRef = useRef<kakao.maps.Polyline | null>(null);
    const glowLineRef = useRef<kakao.maps.Polyline | null>(null);

    useEffect(() => {
        if (!map || !window.kakao || !window.kakao.maps || path.length < 2) {
            console.log("[KakaoPolyline] Waiting for map or path...", {
                map: !!map,
                pathLength: path.length,
                kakao: !!window.kakao?.maps
            });
            return;
        }

        const kakaoPath = path.map(
            (pos) => new window.kakao.maps.LatLng(pos.lat, pos.lng)
        );

        // NOTE: If the map is inverted by CSS (dark mode), 
        // BRIGHT colors in code become DARK on screen.
        // We use a SPECIFIC color in code that becomes NEON CYAN/BLUE on screen after inversion.
        const neonColor = "#cc0c00"; // Deep reddish -> Inverts to bright neon cyan/blue on screen

        // 1. Glow/Background Line
        const newGlowLine = new window.kakao.maps.Polyline({
            path: kakaoPath,
            strokeWeight: strokeWeight + 10,
            strokeColor: "#ffffff", // White in code -> Black on screen
            strokeOpacity: 0.6,
            zIndex: 998,
        });

        // 2. Main Foreground Line
        const newMainLine = new window.kakao.maps.Polyline({
            path: kakaoPath,
            strokeWeight: strokeWeight + 2,
            strokeColor: neonColor,
            strokeOpacity: 1,
            zIndex: 999,
        });

        newGlowLine.setMap(map);
        newMainLine.setMap(map);

        console.log(`[KakaoPolyline] Successfully rendered ${path.length} points.`);

        mainLineRef.current = newMainLine;
        glowLineRef.current = newGlowLine;

        return () => {
            newMainLine.setMap(null);
            newGlowLine.setMap(null);
        };
    }, [map, JSON.stringify(path), strokeColor, strokeWeight, strokeOpacity, showGlow]);

    return null;
}
