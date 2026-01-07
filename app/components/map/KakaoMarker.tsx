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

        // Pin-like structure with pure CSS to match Google Advanced Markers
        content.innerHTML = `
            <div class="relative group cursor-pointer transition-transform duration-200 hover:scale-110">
                <div class="${isFirst ? 'bg-[#FF0055]' : 'bg-[#1e293b]'} w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center relative z-10">
                </div>
                <!-- Needle/Arrow -->
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 ${isFirst ? 'bg-[#FF0055]' : 'bg-[#1e293b]'} rotate-45 border-r border-b border-white z-0"></div>
                
                <!-- Label (Tooltip on hover) -->
                ${title ? `
                <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/20">
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
