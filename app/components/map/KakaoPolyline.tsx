import { useEffect, useState } from "react";
import { useKakaoMap } from "./MapContext";

interface KakaoPolylineProps {
    path: { lat: number; lng: number }[];
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    strokeStyle?: "solid" | "shortdash" | "shortdot" | "shortdashdot" | "shortdashdotdot" | "dot" | "dash" | "dashdot" | "longdash" | "longdashdot" | "longdashdotdot";
}

export function KakaoPolyline({
    path,
    strokeColor = "#25aff4",
    strokeWeight = 4,
    strokeOpacity = 1,
    strokeStyle = "solid",
}: KakaoPolylineProps) {
    const kakaoMapContext = useKakaoMap();
    const map = kakaoMapContext?.map;
    const [polyline, setPolyline] = useState<kakao.maps.Polyline | null>(null);

    useEffect(() => {
        if (!map || !window.kakao || !window.kakao.maps || path.length < 2) return;

        const kakaoPath = path.map(
            (pos) => new window.kakao.maps.LatLng(pos.lat, pos.lng)
        );

        const newPolyline = new window.kakao.maps.Polyline({
            path: kakaoPath,
            strokeWeight,
            strokeColor,
            strokeOpacity,
            strokeStyle,
        });

        newPolyline.setMap(map);
        setPolyline(newPolyline);

        return () => {
            newPolyline.setMap(null);
        };
    }, [map, path, strokeColor, strokeWeight, strokeOpacity, strokeStyle]);

    return null;
}
