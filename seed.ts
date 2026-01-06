import { db } from "./app/db";
import { places } from "./app/db/schema";
import { MOCK_DESTINATIONS } from "./app/lib/mock-data";

async function main() {
    console.log("Seeding places...");

    try {
        // 기존 데이터 삭제 (옵션, 중복 방지를 위해)
        // await db.delete(places); 
        // └ 일단은 삭제하지 않고, id 충돌 시 업데이트하도록 하거나 그대로 둡시다.
        //   Mock 데이터 id는 "1", "2" 등 숫자형 문자열입니다.

        for (const dest of MOCK_DESTINATIONS) {
            await db.insert(places).values({
                id: dest.id, // Mock 데이터의 '1', '2'... 사용
                name: dest.name,
                location: dest.location,
                country: dest.country,
                description: dest.description,
                imageUrl: dest.imageUrl,
                rating: dest.rating,
                reviewCount: dest.reviewCount,
                tags: dest.tags, // JSON array via drizzle 
                lat: dest.coordinates.lat,
                lng: dest.coordinates.lng,
            }).onConflictDoUpdate({
                target: places.id,
                set: {
                    name: dest.name,
                    location: dest.location,
                    country: dest.country,
                    description: dest.description,
                    imageUrl: dest.imageUrl,
                    rating: dest.rating,
                    reviewCount: dest.reviewCount,
                    tags: dest.tags,
                    lat: dest.coordinates.lat,
                    lng: dest.coordinates.lng,
                }
            });
            console.log(`Inserted/Updated: ${dest.name}`);
        }

        console.log("Seeding completed successfully.");
    } catch (e) {
        console.error("Error seeding database:", e);
        process.exit(1);
    }

    process.exit(0);
}

main();
