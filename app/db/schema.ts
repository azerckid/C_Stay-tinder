import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 1. Better Auth Tables
export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
    image: text("image"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id),
});

export const account = sqliteTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// 2. Places Table (여행지 정보)
export const places = sqliteTable("places", {
    id: text("id").primaryKey(), // UUID
    name: text("name").notNull(),
    location: text("location").notNull(),
    country: text("country").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    rating: real("rating"), // 소수점 평점 지원
    reviewCount: integer("review_count").default(0),
    tags: text("tags", { mode: "json" }), // JSON array
    lat: real("lat"), // 좌표
    lng: real("lng"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// 3. User Swipes (사용자 스와이프 기록)
export const userSwipes = sqliteTable("user_swipes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    placeId: text("place_id").notNull().references(() => places.id, { onDelete: "cascade" }),
    action: text("action").notNull(), // 'like' | 'pass' | 'superlike'
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// 4. Trips (생성된 여행 동선)
export const trips = sqliteTable("trips", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    startDate: integer("start_date", { mode: "timestamp" }),
    endDate: integer("end_date", { mode: "timestamp" }),
    status: text("status").default("draft"), // 'draft' | 'published'
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// 5. Trip Items (동선에 포함된 여행지들)
export const tripItems = sqliteTable("trip_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tripId: text("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
    placeId: text("place_id").notNull().references(() => places.id),
    order: integer("order").notNull(), // 순서
    notes: text("notes"),
});
