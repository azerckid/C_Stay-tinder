import { useMapProvider } from "./MapContext";
import { KakaoPolyline } from "./KakaoPolyline";
import { Polyline as GooglePolyline } from "./Polyline";

interface UnifiedPolylineProps {
    path: { lat: number; lng: number }[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    showGlow?: boolean;
}

/**
 * A polyline component that renders either a Google Polyline 
 * or a Kakao Polyline depending on the current map provider.
 */
export function UnifiedPolyline({
    path,
    strokeColor,
    strokeOpacity,
    strokeWeight,
    showGlow,
}: UnifiedPolylineProps) {
    const { provider } = useMapProvider();

    if (provider === "kakao") {
        return (
            <KakaoPolyline
                path={path}
                strokeColor={strokeColor}
                strokeOpacity={strokeOpacity}
                strokeWeight={strokeWeight}
            />
        );
    }

    return (
        <GooglePolyline
            path={path}
            strokeColor={strokeColor}
            strokeOpacity={strokeOpacity}
            strokeWeight={strokeWeight}
            showGlow={showGlow}
        />
    );
}
