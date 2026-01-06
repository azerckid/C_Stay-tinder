import { auth } from "~/lib/auth";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    // Better Auth가 기대하는 내부 콜백 경로로 리다이렉트 (path rewrite)
    // 실제 클라이언트 리다이렉션이 아닌, 내부 핸들러 처리를 위해 URL만 변경하여 전달
    url.pathname = "/api/auth/callback/google";

    // 쿼리 파라미터(code, state 등)는 그대로 유지
    const libRequest = new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
    });

    return auth.handler(libRequest);
}
