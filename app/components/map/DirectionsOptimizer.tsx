import { useEffect, useState, useCallback } from "react";
import { useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
import { UnifiedPolyline } from "./UnifiedPolyline";
import { useMapProvider, useKakaoMap } from "./MapContext";

interface Place {
    id?: string;
    name?: string;
    location?: string;
    coordinates: { lat: number; lng: number };
}

interface DirectionsOptimizerProps {
    places: Place[];
    strokeColor?: string;
    onRouteCalculated?: (result: google.maps.DirectionsResult) => void;
}

export function DirectionsOptimizer(props: DirectionsOptimizerProps) {
    const { provider } = useMapProvider();

    if (provider === "kakao") {
        return <KakaoDirectionsInternal {...props} />;
    }

    // Google Maps mode
    return <GoogleDirectionsInternal {...props} />;
}

/**
 * 🛰️ Google Maps 전용 서비스 로직
 * useMap, useMapsLibrary 등 구글 전용 훅을 여기에서만 사용합니다.
 */
function GoogleDirectionsInternal({ places, onRouteCalculated }: DirectionsOptimizerProps) {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    const placesLibrary = useMapsLibrary("places");
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
    const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>([]);

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
    }, [routesLibrary, map]);

    const getPlaceId = useCallback(async (place: Place): Promise<string | null> => {
        if (!placesLibrary) return null;

        try {
            const { Place } = placesLibrary;
            const request: google.maps.places.SearchByTextRequest = {
                textQuery: `${place.location || ""} ${place.name}`,
                fields: ["id", "location"],
                locationBias: { lat: place.coordinates.lat, lng: place.coordinates.lng }
            };

            const { places: foundPlaces } = await Place.searchByText(request);
            if (foundPlaces && foundPlaces.length > 0) return foundPlaces[0].id;
        } catch (error) {
            console.warn(`⚠️ Google SearchByText failed for [${place.name}]`);
        }
        return null;
    }, [placesLibrary]);

    const calculateRoute = useCallback(async (service: google.maps.DirectionsService) => {
        if (places.length < 2) return;

        const placeIds = await Promise.all(places.map(p => getPlaceId(p)));
        const getPoint = (idx: number) => {
            const id = placeIds[idx];
            return id ? { placeId: id } : { lat: places[idx].coordinates.lat, lng: places[idx].coordinates.lng };
        };

        const waypoints = placeIds.slice(1, -1).map((id, i) => ({
            location: id ? { placeId: id } : { lat: places[i + 1].coordinates.lat, lng: places[i + 1].coordinates.lng },
            stopover: true
        }));

        // Google Maps TRANSIT mode requires exactly 2 waypoints
        // Use DRIVE mode for flexibility with any number of waypoints
        const travelMode = waypoints.length === 2 
            ? google.maps.TravelMode.TRANSIT 
            : google.maps.TravelMode.DRIVING;

        const request: google.maps.DirectionsRequest = {
            origin: getPoint(0),
            destination: getPoint(places.length - 1),
            waypoints: waypoints,
            travelMode: travelMode,
        };

        service.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
                const fullPath: google.maps.LatLngLiteral[] = [];
                result.routes[0].legs.forEach(leg => {
                    leg.steps.forEach(step => {
                        step.path.forEach(p => fullPath.push({ lat: p.lat(), lng: p.lng() }));
                    });
                });
                setRoutePath(fullPath);
                if (onRouteCalculated) onRouteCalculated(result);

                const bounds = new google.maps.LatLngBounds();
                fullPath.forEach(p => bounds.extend(p));
                map?.fitBounds(bounds, 50);
            } else {
                console.warn(`[GoogleDirectionsInternal] Directions API failed: ${status}`, {
                    waypointsCount: waypoints.length,
                    travelMode,
                    placesCount: places.length
                });
                // Fallback to straight line connection
                const fallbackPath = places.map(p => p.coordinates);
                setRoutePath(fallbackPath);
                
                // Fit bounds to fallback path
                if (map && fallbackPath.length > 0) {
                    const bounds = new google.maps.LatLngBounds();
                    fallbackPath.forEach(p => bounds.extend(p));
                    map.fitBounds(bounds, 50);
                }
            }
        });
    }, [places, map, onRouteCalculated, getPlaceId]);

    useEffect(() => {
        if (directionsService && placesLibrary) calculateRoute(directionsService);
    }, [directionsService, placesLibrary, calculateRoute]);

    return (
        <UnifiedPolyline
            path={routePath}
            strokeColor={"#00f3ff"}
            strokeWeight={3}
            strokeOpacity={0.9}
        />
    );
}

/**
 * 🗺️ Kakao Maps 전용 서비스 로직
 */
function KakaoDirectionsInternal({ places }: DirectionsOptimizerProps) {
    const kakaoContext = useKakaoMap();
    const kakaoMap = kakaoContext?.map;
    const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const calculateKakaoRoute = useCallback(async () => {
        if (places.length < 2 || isLoading) return;
        setIsLoading(true);

        try {
            const response = await fetch("/api/directions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    places: places.map(p => ({ lat: p.coordinates.lat, lng: p.coordinates.lng }))
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                console.error("[KakaoDirectionsInternal] API Error:", response.status, errorData);
                throw new Error(`Failed to fetch Kakao directions: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            
            // Check response structure
            if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
                console.warn("[KakaoDirectionsInternal] No routes in response:", data);
                setRoutePath(places.map(p => p.coordinates));
                return;
            }

            const path = data.routes[0].path;

            if (path && Array.isArray(path) && path.length > 0) {
                setRoutePath([...path]);
                if (kakaoMap && window.kakao?.maps) {
                    const bounds = new window.kakao.maps.LatLngBounds();
                    path.forEach((p: any) => {
                        if (p.lat && p.lng) {
                            bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng));
                        }
                    });
                    setTimeout(() => kakaoMap.setBounds(bounds), 500);
                }
            } else {
                console.warn("[KakaoDirectionsInternal] Empty path in response");
                setRoutePath(places.map(p => p.coordinates));
            }
        } catch (error) {
            console.error("[KakaoDirectionsInternal] Error:", error);
            setRoutePath(places.map(p => p.coordinates));
        } finally {
            setIsLoading(false);
        }
    }, [places, kakaoMap]);

    useEffect(() => {
        calculateKakaoRoute();
    }, [calculateKakaoRoute]);

    return (
        <UnifiedPolyline
            path={routePath}
            strokeColor={"#00f3ff"}
            strokeWeight={3}
            strokeOpacity={0.9}
        />
    );
}
