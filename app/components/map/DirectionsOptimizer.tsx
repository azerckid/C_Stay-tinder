import { useEffect, useState, useCallback } from "react";
import { useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
import { Polyline } from "./Polyline";

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

export function DirectionsOptimizer({
    places,
    strokeColor = "#25aff4",
    onRouteCalculated
}: DirectionsOptimizerProps) {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    const placesLibrary = useMapsLibrary("places"); // 💡 Places 라이브러리 로드
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
    const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
    }, [routesLibrary, map]);

    // 💡 장소명으로 Place ID를 가져오는 함수 (최신 Place.searchByText API 사용)
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
            if (foundPlaces && foundPlaces.length > 0) {
                console.log(`📍 Found Place ID for [${place.name}]:`, foundPlaces[0].id);
                return foundPlaces[0].id;
            }
        } catch (error) {
            console.warn(`⚠️ Could not find Place ID for [${place.name}] via SearchByText, using coords instead.`, error);
        }
        return null;
    }, [placesLibrary]);

    const calculateRoute = useCallback(async (service: google.maps.DirectionsService) => {
        if (places.length < 2) return;

        // 모든 장소의 Place ID를 병렬로 검색
        const placeIdPromises = places.map(p => getPlaceId(p));
        const placeIds = await Promise.all(placeIdPromises);

        // DirectionsRequest 구성 (Place ID가 있으면 ID 사용, 없으면 좌표 사용)
        const getPoint = (idx: number) => {
            const id = placeIds[idx];
            if (id) return { placeId: id };
            return { lat: places[idx].coordinates.lat, lng: places[idx].coordinates.lng };
        };

        const request: google.maps.DirectionsRequest = {
            origin: getPoint(0),
            destination: getPoint(places.length - 1),
            waypoints: placeIds.slice(1, -1).map((id, i) => ({
                location: id ? { placeId: id } : { lat: places[i + 1].coordinates.lat, lng: places[i + 1].coordinates.lng },
                stopover: true
            })),
            travelMode: google.maps.TravelMode.TRANSIT, // 한국 도로망 최적화
        };

        service.route(request, (result, status) => {
            console.log("🛰️ Google Directions API (with Places ID) Status:", status);

            if (status === google.maps.DirectionsStatus.OK && result) {
                const fullPath: google.maps.LatLngLiteral[] = [];
                const route = result.routes[0];

                // 상세 경로 추출
                route.legs.forEach(leg => {
                    leg.steps.forEach(step => {
                        step.path.forEach(p => fullPath.push({ lat: p.lat(), lng: p.lng() }));
                    });
                });

                console.log("✅ Accurate road path extracted with", fullPath.length, "points");
                setRoutePath(fullPath);
                if (onRouteCalculated) onRouteCalculated(result);
                fitToPath(fullPath);
            } else {
                console.warn("Directions failed with IDs, falling back to straight lines.");
                const fallback = places.map(p => p.coordinates);
                setRoutePath(fallback);
                fitToPath(fallback);
            }
        });
    }, [places, map, onRouteCalculated, getPlaceId]);

    const fitToPath = (path: google.maps.LatLngLiteral[]) => {
        if (!map || path.length === 0) return;
        const bounds = new google.maps.LatLngBounds();
        path.forEach(p => bounds.extend(p));
        map.fitBounds(bounds, 50);
    };

    useEffect(() => {
        if (directionsService && placesLibrary) calculateRoute(directionsService);
    }, [directionsService, placesLibrary, calculateRoute]);

    if (routePath.length === 0) return null;

    return (
        <Polyline
            path={routePath}
            strokeColor={strokeColor}
            strokeWeight={4}
            strokeOpacity={0}
        />
    );
}
