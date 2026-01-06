import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("route", "routes/route.tsx"),
  route("auth/*", "routes/api/auth/$.ts"),
  route("api/swipes", "routes/api/swipes.ts"),
  route("api/trips/create", "routes/api/trips.create.ts"),
] satisfies RouteConfig;
