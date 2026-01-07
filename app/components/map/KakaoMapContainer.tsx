import { useEffect, useRef, useState } from "react";
import { KakaoMapContext } from "./MapContext";

interface KakaoMapContainerProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    className?: string;
    children?: React.ReactNode;
}

export function KakaoMapContainer({
    center,
    zoom = 3,
    className,
    children,
}: KakaoMapContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<kakao.maps.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Default center to Seoul if not provided
    const defaultCenter = { lat: 37.5665, lng: 126.978 };
    const targetCenter = center || defaultCenter;

    useEffect(() => {
        const loadMap = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    if (!containerRef.current) return;

                    const options = {
                        center: new window.kakao.maps.LatLng(targetCenter.lat, targetCenter.lng),
                        level: zoom,
                    };

                    const newMap = new window.kakao.maps.Map(containerRef.current, options);
                    setMap(newMap);
                    setIsLoaded(true);
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
        <div className={`w-full h-full relative ${className}`}>
            <div ref={containerRef} className="w-full h-full" />
            <KakaoMapContext.Provider value={{ map }}>
                {isLoaded && children}
            </KakaoMapContext.Provider>
        </div>
    );
}
