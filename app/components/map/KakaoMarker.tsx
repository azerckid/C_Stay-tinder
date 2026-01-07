import { useEffect, useRef } from "react";
import { useKakaoMap } from "./MapContext";

interface KakaoMarkerProps {
    position: { lat: number; lng: number };
    title?: string;
    isFirst?: boolean;
}

export function KakaoMarker({ position, title, isFirst = false }: KakaoMarkerProps) {
    const kakaoMapContext = useKakaoMap();
    const map = kakaoMapContext?.map;
    const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

    useEffect(() => {
        if (!map || !window.kakao || !window.kakao.maps) return;

        // Create the content element for the marker
        const content = document.createElement('div');
        content.className = 'relative flex items-center justify-center';

        // Pure inline styles to guarantee design consistency in Kakao pane
        const markerColor = isFirst ? '#FF0055' : '#1e293b';
        content.innerHTML = `
            <div style="position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); position: relative; z-index: 10;">
                </div>
                <!-- Needle -->
                <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 12px; height: 12px; background-color: ${markerColor}; border-right: 2px solid white; border-bottom: 2px solid white; z-index: 0;"></div>
                
                ${title ? `
                <div style="position: absolute; top: -40px; left: 50%; transform: translateX(-50%); background-color: rgba(0,0,0,0.8); color: white; font-size: 10px; padding: 4px 8px; border-radius: 4px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);">
                    ${title}
                </div>
                ` : ''}
            </div>
        `;

        const overlayPosition = new window.kakao.maps.LatLng(position.lat, position.lng);

        const newOverlay = new window.kakao.maps.CustomOverlay({
            position: overlayPosition,
            content: content,
            yAnchor: 1, // Anchor to the bottom
            zIndex: isFirst ? 100 : 50
        });

        newOverlay.setMap(map);
        overlayRef.current = newOverlay;

        return () => {
            newOverlay.setMap(null);
        };
    }, [map, position, title, isFirst]);

    return null;
}
