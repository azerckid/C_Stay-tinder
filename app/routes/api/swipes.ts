import { auth } from "~/lib/auth";
import { db } from "~/db";
import { userSwipes } from "~/db/schema";
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

        // 스와이프 기록 저장
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
