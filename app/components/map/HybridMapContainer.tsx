import { useState, useEffect } from "react";
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
 * Includes fallback logic in case one provider fails to load.
 */
export function HybridMapContainer({
    center,
    zoom,
    className,
    children,
    forceProvider,
}: HybridMapContainerProps) {
    const isKorea = center ? isKoreanRegion(center.lat, center.lng) : true;
    const initialProvider: MapProviderType = forceProvider || (isKorea ? "kakao" : "google");

    const [activeProvider, setActiveProvider] = useState<MapProviderType>(initialProvider);
    const [hasError, setHasError] = useState(false);

    // Sync with prop changes
    useEffect(() => {
        if (forceProvider) {
            setActiveProvider(forceProvider);
        } else {
            setActiveProvider(isKorea ? "kakao" : "google");
        }
    }, [forceProvider, isKorea]);

    const handleProviderError = (error: string) => {
        console.warn(`Map Provider (${activeProvider}) error: ${error}. Falling back...`);
        if (activeProvider === "kakao" && !forceProvider) {
            setActiveProvider("google");
            setHasError(true);
        }
    };

    return (
        <MapProviderContext.Provider value={{ provider: activeProvider }}>
            <div className="w-full h-full relative">
                {activeProvider === "kakao" ? (
                    <KakaoMapContainer
                        center={center}
                        zoom={zoom}
                        className={className}
                        onError={handleProviderError}
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

                {hasError && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white/80 border border-white/10 pointer-events-none">
                        지도 최적화 중 (구글 맵으로 전환됨)
                    </div>
                )}
            </div>
        </MapProviderContext.Provider>
    );
}
