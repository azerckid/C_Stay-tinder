import type { ActionFunctionArgs } from "react-router";
import { isKoreanRegion } from "~/lib/map-utils";
import { fetchKakaoDirections } from "~/lib/directions/kakao-directions";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { places } = await request.json();

        if (!places || places.length < 2) {
            return new Response(JSON.stringify({ error: "At least 2 places required" }), { status: 400 });
        }

        // Check if all places are in Korea
        const allKorean = places.every((p: any) => isKoreanRegion(p.lat, p.lng));

        if (allKorean) {
            console.log(`[Direction API] Using Kakao Directions for ${places.length} places...`);
            const kakaoKey = process.env.VITE_KAKAO_MAP_REST_API_KEY;

            if (!kakaoKey) {
                console.error("[Direction API] CRITICAL: VITE_KAKAO_MAP_REST_API_KEY is missing in .env");
                return new Response(JSON.stringify({ error: "Missing Kakao API Key" }), { status: 500 });
            }

            try {
                const data = await fetchKakaoDirections({ places });
                return new Response(JSON.stringify(data), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            } catch (kakaoError: any) {
                console.error("[Direction API] Kakao Directions Error:", kakaoError);
                return new Response(JSON.stringify({ error: "Kakao Directions Failed", details: kakaoError.message }), { status: 500 });
            }
        }

        // Global / Mixed region: Use Google Maps
        const origin = places[0];
        const destination = places[places.length - 1];
        const intermediates = places.slice(1, -1).map((p: any) => ({
            location: { latLng: { latitude: p.lat, longitude: p.lng } }
        }));

        const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.error("[Direction API] Missing Google API Key.");
            return new Response(JSON.stringify({ error: "Configuration Error" }), { status: 500 });
        }

        console.log(`[Direction API] Using Google Routes for ${places.length} places...`);

        const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs",
            },
            body: JSON.stringify({
                origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
                destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
                intermediates: intermediates,
                travelMode: "DRIVE",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Direction API] Google Routes API Error:", response.status, errorText);
            return new Response(JSON.stringify({ error: "Failed to fetch directions", details: errorText }), { status: 500 });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("[Direction API] Internal Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
