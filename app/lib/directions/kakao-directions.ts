import { isKoreanRegion } from "../map-utils";

export interface DirectionsRequest {
    places: { lat: number; lng: number }[];
}

export interface DirectionsResponse {
    polyline: { encodedPolyline: string } | null;
    path?: { lat: number; lng: number }[]; // For Kakao, we return raw path
    duration?: string;
    distanceMeters?: number;
}

export async function fetchKakaoDirections(request: DirectionsRequest): Promise<any> {
    const { places } = request;
    const apiKey = process.env.VITE_KAKAO_MAP_REST_API_KEY;

    if (!apiKey) {
        throw new Error("Missing Kakao REST API Key");
    }

    const origin = places[0];
    const destination = places[places.length - 1];
    const waypoints = places.slice(1, -1)
        .map(p => `${p.lng},${p.lat}`)
        .join("|");

    const query = new URLSearchParams({
        origin: `${origin.lng},${origin.lat}`,
        destination: `${destination.lng},${destination.lat}`,
        waypoints: waypoints,
        priority: "RECOMMEND",
    });

    const response = await fetch(`https://apis-navi.kakao.com/v1/directions?${query.toString()}`, {
        headers: {
            Authorization: `KakaoAK ${apiKey}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kakao Directions API Error: ${errorText}`);
    }

    const data = await response.json();

    // Transform Kakao response to a structure compatible with our frontend
    // Kakao returns raw coordinates in sections -> roads -> vertexes
    const path: { lat: number; lng: number }[] = [];
    data.routes[0].sections.forEach((section: any) => {
        section.roads.forEach((road: any) => {
            for (let i = 0; i < road.vertexes.length; i += 2) {
                path.push({
                    lng: road.vertexes[i],
                    lat: road.vertexes[i + 1],
                });
            }
        });
    });

    return {
        routes: [
            {
                duration: `${data.routes[0].summary.duration}s`,
                distanceMeters: data.routes[0].summary.distance,
                path: path, // We'll handle both encoded and raw path in the frontend
                provider: "kakao",
            },
        ],
    };
}
