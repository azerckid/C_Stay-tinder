import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { places } = await request.json();

        if (!places || places.length < 2) {
            return new Response(JSON.stringify({ error: "At least 2 places required" }), { status: 400 });
        }

        const origin = places[0];
        const destination = places[places.length - 1];
        const intermediates = places.slice(1, -1).map((p: any) => ({
            location: { latLng: { latitude: p.lat, longitude: p.lng } }
        }));

        const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.error("[Direction API] Missing API Key. Check VITE_GOOGLE_MAPS_API_KEY in .env");
            return new Response(JSON.stringify({ error: "Configuration Error: Missing API Key" }), { status: 500 });
        }

        console.log(`[Direction API] Requesting Routes for ${places.length} places...`);

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

        // Debugging Logs
        console.log(`[Direction API] Response OK. Routes found: ${data.routes?.length ?? 0}`);
        if (data.routes?.length > 0) {
            console.log("[Direction API] First Route Keys:", Object.keys(data.routes[0]));
            console.log("[Direction API] Polyline Field Present:", !!data.routes[0].polyline);
            if (data.routes[0].polyline) {
                console.log("[Direction API] Polyline encoded length:", data.routes[0].polyline.encodedPolyline?.length);
            } else {
                console.warn("[Direction API] WARNING: 'polyline' field missing in route object");
                console.log("[Direction API] Full Route Object:", JSON.stringify(data.routes[0], null, 2));
            }
        } else {
            console.warn("[Direction API] WARNING: Routes array is empty");
            console.log("[Direction API] Full Response:", JSON.stringify(data, null, 2));
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("[Direction API] Internal Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
