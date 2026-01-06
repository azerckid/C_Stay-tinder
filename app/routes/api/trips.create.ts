import { auth } from "~/lib/auth";
import { db } from "~/db";
import { trips, tripItems, userSwipes, places } from "~/db/schema";
import { eq, and, desc } from "drizzle-orm";
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
        const userId = session.user.id;

        // 1. 사용자가 Like한 장소들 조회 (최신순)
        const likedSwipes = await db
            .select({
                placeId: userSwipes.placeId,
            })
            .from(userSwipes)
            .where(and(eq(userSwipes.userId, userId), eq(userSwipes.action, "like")))
            .orderBy(desc(userSwipes.createdAt));

        if (likedSwipes.length === 0) {
            return new Response(JSON.stringify({ error: "No liked places found" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. 여행(Trip) 생성
        // UUID 생성을 위해 crypto 사용 (Node 19+ or global)
        const tripId = crypto.randomUUID();
        const tripTitle = `My Auto-Planned Trip ${new Date().toLocaleDateString()}`;

        await db.insert(trips).values({
            id: tripId,
            userId: userId,
            title: tripTitle,
            status: "draft",
        });

        // 3. 여행 아이템(Trip Items) 생성
        // 간단하게 순서대로 넣음 (추후 거리순 최적화 필요)
        const itemsToInsert = likedSwipes.map((swipe, index) => ({
            tripId: tripId,
            placeId: swipe.placeId,
            order: index + 1,
        }));

        await db.insert(tripItems).values(itemsToInsert);

        return new Response(JSON.stringify({ success: true, tripId }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Failed to create trip:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
