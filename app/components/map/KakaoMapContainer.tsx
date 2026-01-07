import { useEffect, useRef, useState } from "react";
import { KakaoMapContext } from "./MapContext";

interface KakaoMapContainerProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    className?: string;
    children?: React.ReactNode;
    onError?: (error: string) => void;
}

export function KakaoMapContainer({
    center,
    zoom = 3,
    className,
    children,
    onError,
}: KakaoMapContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<kakao.maps.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Default center to Seoul if not provided
    const defaultCenter = { lat: 37.5665, lng: 126.978 };
    const targetCenter = center || defaultCenter;

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 50; // 5 seconds total

        const loadMap = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    if (!containerRef.current) return;

                    try {
                        const options = {
                            center: new window.kakao.maps.LatLng(targetCenter.lat, targetCenter.lng),
                            level: zoom,
                        };

                        const newMap = new window.kakao.maps.Map(containerRef.current, options);
                        setMap(newMap);
                        setIsLoaded(true);
                    } catch (e) {
                        console.error("Failed to initialize Kakao Map:", e);
                        onError?.("Initialization Failed");
                    }
                });
            }
        };

        if (window.kakao && window.kakao.maps) {
            loadMap();
        } else {
            const interval = setInterval(() => {
                if (window.kakao && window.kakao.maps) {
                    loadMap();
                    clearInterval(interval);
                } else {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        clearInterval(interval);
                        console.error("Kakao Maps SDK failed to load");
                        onError?.("SDK Load Timeout");
                    }
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        if (map && center) {
            map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
        }
    }, [map, center]);

    useEffect(() => {
        if (map && zoom) {
            map.setLevel(zoom);
        }
    }, [map, zoom]);

    return (
        <div className={`w-full h-full relative overflow-hidden ${className}`}>
            {/* 
          Dark Mode Simulation for Kakao Maps 
          Inverts colors and adjusts hue to maintain a blue/dark aesthetic
      */}
            <div
                ref={containerRef}
                className="w-full h-full"
                style={{
                    filter: 'invert(90%) hue-rotate(180deg) brightness(1.1) contrast(0.9)',
                    backgroundColor: '#242f3e' // Fallback color
                }}
            />
            <KakaoMapContext.Provider value={{ map }}>
                {isLoaded && children}
            </KakaoMapContext.Provider>
        </div>
    );
}
