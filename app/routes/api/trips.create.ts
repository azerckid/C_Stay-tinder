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

        // 1. 사용자가 Like한 장소들 및 해당 장소의 좌표 정보 조회
        const likedPlaces = await db
            .select({
                id: places.id,
                lat: places.lat,
                lng: places.lng,
            })
            .from(userSwipes)
            .innerJoin(places, eq(userSwipes.placeId, places.id))
            .where(and(eq(userSwipes.userId, userId), eq(userSwipes.action, "like")))
            .orderBy(desc(userSwipes.createdAt));

        if (likedPlaces.length === 0) {
            return new Response(JSON.stringify({ error: "No liked places found" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. 여행(Trip) 생성
        const tripId = crypto.randomUUID();
        const tripTitle = `My Auto-Planned Trip ${new Date().toLocaleDateString()}`;

        await db.insert(trips).values({
            id: tripId,
            userId: userId,
            title: tripTitle,
            status: "draft",
        });

        // 3. 동선 최적화 (TSP 알고리즘 적용)
        // 좌표가 없는 경우를 대비해 필터링 후 최적화 수행
        const validPlaces = likedPlaces.filter(p => p.lat !== null && p.lng !== null) as { id: string; lat: number; lng: number }[];
        const invalidPlaces = likedPlaces.filter(p => p.lat === null || p.lng === null);

        const { optimizeRoute } = await import("~/lib/optimizer");
        const optimizedRoute = optimizeRoute(validPlaces);

        // 최적화된 장소들과 좌표가 없어 제외된 장소들을 합침
        const finalOrder = [...optimizedRoute, ...invalidPlaces];

        // 4. 여행 아이템(Trip Items) 생성
        const itemsToInsert = finalOrder.map((place, index) => ({
            tripId: tripId,
            placeId: place.id,
            order: index + 1,
        }));

        await db.insert(tripItems).values(itemsToInsert);

        // 💡 4. 여행 생성 후 스와이프 기록 초기화 (Itinerary 비우기)
        // 사용자가 이미 '여행 계획'으로 확정한 장소들이므로, 다음 계획을 위해 비워줍니다.
        await db.delete(userSwipes).where(
            and(
                eq(userSwipes.userId, userId),
                eq(userSwipes.action, "like")
            )
        );

        return new Response(JSON.stringify({ success: true, tripId }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Failed to create trip:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
