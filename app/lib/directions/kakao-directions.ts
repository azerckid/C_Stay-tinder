import dns from 'node:dns';
import { isKoreanRegion } from "../map-utils";

// 🌐 Node.js v18+ 환경에서 IPv6 우선으로 인한 DNS 해석 오류(ENOTFOUND) 방지
if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
}

export interface DirectionsRequest {
    places: { lat: number; lng: number }[];
}

export interface DirectionsResponse {
    routes: {
        duration: string;
        distanceMeters: number;
        path: { lat: number; lng: number }[];
        provider: string;
    }[];
}

/**
 * Kakao Directions API has a limit of 5 waypoints per request.
 * To handle any number of places, we split the request into multiple chunks.
 */
export async function fetchKakaoDirections(request: DirectionsRequest): Promise<DirectionsResponse> {
    const { places } = request;
    // Vercel: 서버 사이드에서는 VITE_ 접두사 없이 환경 변수 사용
    const apiKey = process.env.KAKAO_MAP_REST_API_KEY || process.env.VITE_KAKAO_MAP_REST_API_KEY;

    if (!apiKey) {
        throw new Error("Missing Kakao REST API Key (KAKAO_MAP_REST_API_KEY or VITE_KAKAO_MAP_REST_API_KEY)");
    }

    if (places.length < 2) {
        throw new Error("At least 2 places are required for directions");
    }

    // Split places into segments: Each segment can have up to 7 points (Origin + 5 Waypoints + Destination)
    // We overlap the last point of segment N as the origin of segment N+1
    const segments: { origin: any, destination: any, waypoints: any[] }[] = [];
    const pointsPerCall = 7; // Max points per Kakao request (1 origin + 5 waypoints + 1 destination)

    for (let i = 0; i < places.length - 1; i += (pointsPerCall - 1)) {
        const chunk = places.slice(i, i + pointsPerCall);
        if (chunk.length < 2) break;

        segments.push({
            origin: chunk[0],
            destination: chunk[chunk.length - 1],
            waypoints: chunk.slice(1, -1),
        });
    }

    console.log(`[KakaoDirections] Splitting ${places.length} places into ${segments.length} API calls...`);

    // Fetch all segments in parallel
    const segmentPromises = segments.map(async (seg, index) => {
        try {
            const originParam = `${seg.origin.lng},${seg.origin.lat},name=P${index}`;
            const destinationParam = `${seg.destination.lng},${seg.destination.lat},name=P${index + 1}`;
            const waypointsParam = seg.waypoints.map(w => `${w.lng},${w.lat}`).join("|");

            const queryParams: Record<string, string> = {
                origin: originParam,
                destination: destinationParam,
                priority: "RECOMMEND",
            };

            if (waypointsParam) {
                queryParams.waypoints = waypointsParam;
            }

            const query = new URLSearchParams(queryParams);
            const url = `https://apis-navi.kakaomobility.com/v1/directions?${query.toString()}`;

            console.log(`[KakaoDirections] Requesting segment ${index}: ${url.substring(0, 100)}...`);

            const response = await fetch(url, {
                headers: {
                    Authorization: `KakaoAK ${apiKey}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[KakaoDirections] Segment ${index} API Error (${response.status}):`, errorText);
                throw new Error(`Kakao API returned ${response.status}`);
            }

            const data = await response.json();

            // Check for Kakao-specific error codes in body
            if (data.trans_id === undefined && data.routes === undefined) {
                console.error(`[KakaoDirections] Probable API error for segment ${index}:`, data);
                throw new Error(data.msg || "Unknown Kakao API Error");
            }

            if (!data.routes || data.routes.length === 0) {
                console.warn(`[KakaoDirections] No routes found for segment ${index}. Check if points are too far or on islands.`);
                throw new Error("No route found");
            }

            // Extract vertexes from the first route
            const segmentPath: { lat: number; lng: number }[] = [];
            data.routes[0].sections?.forEach((section: any) => {
                section.roads?.forEach((road: any) => {
                    if (road.vertexes && Array.isArray(road.vertexes)) {
                        for (let j = 0; j < road.vertexes.length; j += 2) {
                            const lng = parseFloat(road.vertexes[j]);
                            const lat = parseFloat(road.vertexes[j + 1]);
                            if (!isNaN(lat) && !isNaN(lng)) {
                                segmentPath.push({ lat, lng });
                            }
                        }
                    }
                });
            });

            if (segmentPath.length === 0) {
                throw new Error("Empty path in response");
            }

            return {
                path: segmentPath,
                duration: data.routes[0].summary?.duration || 0,
                distance: data.routes[0].summary?.distance || 0,
                success: true
            };
        } catch (error: any) {
            console.error(`[KakaoDirections] CRITICAL Error in segment ${index}:`, {
                message: error.message,
                cause: error.cause,
                stack: error.stack
            });

            if (error.message.includes('getaddrinfo')) {
                console.warn("[KakaoDirections] DNS Lookup Failed. Please check your internet connection or if apis-navi.kakao.com is accessible.");
            }

            // Fallback: Straight line for this segment
            return {
                path: [seg.origin, seg.destination],
                duration: 0,
                distance: 0,
                success: false
            };
        }
    });

    const results = await Promise.all(segmentPromises);

    // Merge all segments into one path
    const finalPath: { lat: number; lng: number }[] = [];
    let totalDuration = 0;
    let totalDistance = 0;

    results.forEach((res, idx) => {
        // Avoid duplicating the connecting point (last of prev segment is same as first of next)
        if (idx === 0) {
            finalPath.push(...res.path);
        } else {
            finalPath.push(...res.path.slice(1));
        }
        totalDuration += res.duration;
        totalDistance += res.distance;
    });

    return {
        routes: [
            {
                duration: `${totalDuration}s`,
                distanceMeters: totalDistance,
                path: finalPath,
                provider: "kakao",
            },
        ],
    };
}
