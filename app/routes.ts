import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("route", "routes/route.tsx"),
  route("auth/google/callback", "routes/auth/google/callback.tsx"),
  route("api/auth/*", "routes/api/auth/$.ts"),
] satisfies RouteConfig;
