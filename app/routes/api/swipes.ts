import { auth } from "~/lib/auth";
import { db } from "~/db";
import { userSwipes } from "~/db/schema";
import { and, eq } from "drizzle-orm";
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
        const formData = await request.formData();
        const placeId = formData.get("placeId") as string;
        const action = formData.get("action") as string; // 'like', 'pass', 'superlike'

        if (!placeId || !action) {
            return new Response("Missing required fields", { status: 400 });
        }

        // 💡 중복 방지: 동일 유저의 해당 장소에 대한 기존 스와이프 기록을 모두 삭제
        // 이렇게 하면 항상 '최신' 액션 하나만 남게 됩니다.
        await db.delete(userSwipes).where(
            and(
                eq(userSwipes.userId, session.user.id),
                eq(userSwipes.placeId, placeId)
            )
        );

        // 새 스와이프 기록 저장
        await db.insert(userSwipes).values({
            userId: session.user.id,
            placeId,
            action,
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Failed to save swipe:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
