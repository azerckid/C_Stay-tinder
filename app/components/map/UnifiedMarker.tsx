import { useMapProvider } from "./MapContext";
import { KakaoMarker } from "./KakaoMarker";
import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

interface UnifiedMarkerProps {
    position: { lat: number; lng: number };
    title?: string;
    isFirst?: boolean;
}

/**
 * A marker component that renders either a Google AdvancedMarker 
 * or a Kakao Marker depending on the current map provider.
 */
export function UnifiedMarker({ position, title, isFirst = false }: UnifiedMarkerProps) {
    const { provider } = useMapProvider();

    if (provider === "kakao") {
        return <KakaoMarker position={position} title={title} />;
    }

    return (
        <AdvancedMarker position={position} title={title}>
            <Pin
                background={isFirst ? "#FF0055" : "#1e293b"}
                borderColor={"#ffffff"}
                glyphColor={"#ffffff"}
            />
        </AdvancedMarker>
    );
}
