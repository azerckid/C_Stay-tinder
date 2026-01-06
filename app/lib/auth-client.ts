import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:5173/auth", // 개발 환경 URL. 배포 시 변경 필요
});
