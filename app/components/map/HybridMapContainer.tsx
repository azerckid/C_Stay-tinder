import { isKoreanRegion } from "~/lib/map-utils";
import { MapContainer as GoogleMapContainer } from "./MapContainer";
import { KakaoMapContainer } from "./KakaoMapContainer";
import { MapProviderContext, type MapProviderType } from "./MapContext";

interface HybridMapContainerProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    className?: string;
    children?: React.ReactNode;
    forceProvider?: "google" | "kakao";
}

/**
 * A map container that automatically switches between Kakao Maps (Korea) 
 * and Google Maps (Global) based on the center coordinate.
 */
export function HybridMapContainer({
    center,
    zoom,
    className,
    children,
    forceProvider,
}: HybridMapContainerProps) {
    // Determine if we should use Kakao Maps
    const isKorea = center ? isKoreanRegion(center.lat, center.lng) : true;
    const provider: MapProviderType = forceProvider || (isKorea ? "kakao" : "google");

    return (
        <MapProviderContext.Provider value={{ provider }}>
            {provider === "kakao" ? (
                <KakaoMapContainer
                    center={center}
                    zoom={zoom}
                    className={className}
                >
                    {children}
                </KakaoMapContainer>
            ) : (
                <GoogleMapContainer
                    center={center}
                    zoom={zoom}
                    className={className}
                >
                    {children}
                </GoogleMapContainer>
            )}
        </MapProviderContext.Provider>
    );
}
