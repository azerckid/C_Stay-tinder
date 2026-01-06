import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/db";
import * as schema from "~/db/schema";
// import { google } from "better-auth/social-providers"; // Note: better-auth social imports might vary by version

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: {
            // Mapping tables if names differ from default, but we used defaults matched to better-auth
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
        // Kakao, Twitter can be added here
    },
    // Add other configurations as needed
});
