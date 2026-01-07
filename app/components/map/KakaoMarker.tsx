import { useEffect, useState } from "react";
import { useKakaoMap } from "./MapContext";

interface KakaoMarkerProps {
    position: { lat: number; lng: number };
    title?: string;
}

export function KakaoMarker({ position, title }: KakaoMarkerProps) {
    const kakaoMapContext = useKakaoMap();
    const map = kakaoMapContext?.map;
    const [marker, setMarker] = useState<kakao.maps.Marker | null>(null);

    useEffect(() => {
        if (!map || !window.kakao || !window.kakao.maps) return;

        const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng);

        const newMarker = new window.kakao.maps.Marker({
            position: markerPosition,
            title: title,
        });

        newMarker.setMap(map);
        setMarker(newMarker);

        return () => {
            newMarker.setMap(null);
        };
    }, [map, position, title]);

    return null;
}
