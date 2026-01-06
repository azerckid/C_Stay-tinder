import { auth } from "~/lib/auth";
import { db } from "~/db";
import { trips } from "~/db/schema";
import { eq, and } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST" && request.method !== "PATCH") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const formData = await request.formData();
        const tripId = formData.get("tripId") as string;
        const title = formData.get("title") as string;

        if (!tripId || !title) {
            return new Response("Missing required fields", { status: 400 });
        }

        // Update trip title if it belongs to the user
        const result = await db.update(trips)
            .set({ title })
            .where(and(eq(trips.id, tripId), eq(trips.userId, session.user.id)))
            .returning();

        if (result.length === 0) {
            return new Response("Trip not found or unauthorized", { status: 404 });
        }

        return new Response(JSON.stringify({ success: true, trip: result[0] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Failed to update trip:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
