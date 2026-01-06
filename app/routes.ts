import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("route", "routes/route.tsx"),
  route("auth/*", "routes/api/auth/$.ts"),
  route("api/swipes", "routes/api/swipes.ts"),
  route("api/trips/create", "routes/api/trips.create.ts"),
  route("api/trips/update", "routes/api/trips.update.ts"),
  route("api/directions", "routes/api/directions.ts"),
  route("trips", "routes/trips.index.tsx"),
  route("trips/:tripId", "routes/trips.$tripId.tsx"),
] satisfies RouteConfig;
