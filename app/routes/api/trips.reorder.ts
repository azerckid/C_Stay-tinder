import { auth } from "~/lib/auth";
import { db } from "~/db";
import { tripItems, trips } from "~/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const { tripId, items } = await request.json();

        if (!tripId || !items || !Array.isArray(items)) {
            return new Response("Invalid request data", { status: 400 });
        }

        // 1. Verify trip ownership
        const trip = await db.query.trips.findFirst({
            where: and(eq(trips.id, tripId), eq(trips.userId, session.user.id)),
        });

        if (!trip) {
            return new Response("Trip not found or unauthorized", { status: 404 });
        }

        // 2. Update orders in a transaction or sequential updates
        // For SQLite, we can update them one by one or using a CASE statement.
        // Simple approach: Iterate and update
        for (const item of items) {
            await db.update(tripItems)
                .set({ order: item.order })
                .where(and(eq(tripItems.id, item.id), eq(tripItems.tripId, tripId)));
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Failed to reorder trip items:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
