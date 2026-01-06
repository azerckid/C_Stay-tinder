import type { Route } from "./+types/trips.$tripId";
import { useLoaderData, Link } from "react-router";
import { db } from "~/db";
import { trips, tripItems, places, userSwipes } from "~/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { useState } from "react";
import { MapContainer } from "~/components/map/MapContainer";
import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { DirectionsOptimizer } from "~/components/map/DirectionsOptimizer";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Car, Share2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export async function loader({ params }: Route.LoaderArgs) {
    const { tripId } = params;
    if (!tripId) throw new Response("Not Found", { status: 404 });

    const trip = await db.query.trips.findFirst({
        where: eq(trips.id, tripId),
    });

    if (!trip) throw new Response("Trip Not Found", { status: 404 });

    const items = await db
        .select({
            id: tripItems.id,
            order: tripItems.order,
            place: places,
        })
        .from(tripItems)
        .innerJoin(places, eq(tripItems.placeId, places.id))
        .where(eq(tripItems.tripId, tripId))
        .orderBy(asc(tripItems.order));

    // Transform for UI (Deduplicate Places)
    const uniqueItems = new Map();
    items.forEach((item) => {
        if (!uniqueItems.has(item.place.id)) {
            uniqueItems.set(item.place.id, item);
        }
    });

    const placesData = Array.from(uniqueItems.values()).map((item) => ({
        ...item.place,
        coordinates: { lat: item.place.lat || 0, lng: item.place.lng || 0 },
    }));

    return { trip, places: placesData };
}

export default function TripDetailPage() {
    const { trip, places } = useLoaderData<typeof loader>();

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("링크가 복사되었습니다!");
    };

    return (
        <div className="min-h-screen bg-background-dark text-white font-sans max-w-md mx-auto flex flex-col relative">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
                <Link to="/trips" className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <Button size="icon" variant="ghost" className="rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                </Button>
            </header>

            {/* Map Section - 50% height */}
            <div className="h-[50vh] w-full shrink-0 relative">
                <MapContainer
                    center={places[0]?.coordinates || { lat: 37.5665, lng: 126.9780 }}
                    zoom={12}
                    className="w-full h-full"
                >
                    {places.map((dest, index) => (
                        <AdvancedMarker
                            key={dest.id}
                            position={dest.coordinates}
                            title={dest.name}
                        >
                            <Pin
                                background={index === 0 ? "#FF0055" : "#1e293b"}
                                borderColor={"#ffffff"}
                                glyphColor={"#ffffff"}
                            />
                        </AdvancedMarker>
                    ))}
                    {places.length >= 2 && (
                        <DirectionsOptimizer
                            places={places}
                            strokeColor="#25aff4" // Design System Primary (or Pink #FF0055)
                        />
                    )}
                </MapContainer>
                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background-dark to-transparent pointer-events-none z-10" />
            </div>

            {/* Content Section */}
            <div className="flex-1 bg-background-dark -mt-6 rounded-t-3xl relative z-20 px-6 pt-8 pb-10 shadow-t-2xl shadow-black/50 overflow-hidden flex flex-col">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-2xl font-bold">{trip.title}</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>
                            {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "날짜 미정"}
                            {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString()}`}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{places.length} Places</span>
                    </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto hide-scrollbar">
                    <div className="relative pl-4 border-l-2 border-dashed border-gray-800 space-y-8 pb-10">
                        {places.map((place, index) => {
                            const isFirst = index === 0;
                            return (
                                <motion.div
                                    key={place.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative"
                                >
                                    {/* Dot */}
                                    <div className={`absolute -left-[25px] top-0 size-5 rounded-full border-4 border-background-dark shadow-sm z-10 ${isFirst ? "bg-primary" : "bg-gray-600"}`} />

                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-lg font-bold text-white">{place.name}</h3>
                                        <div className="flex gap-4 p-3 bg-surface-dark rounded-xl border border-white/5">
                                            <div className="size-16 shrink-0 rounded-lg bg-gray-800 overflow-hidden">
                                                {place.imageUrl && <img src={place.imageUrl} className="w-full h-full object-cover" alt={place.name} />}
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <p className="text-xs text-gray-400 line-clamp-2">{place.description}</p>
                                                <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{place.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Connector (if not last) */}
                                    {index < places.length - 1 && (
                                        <div className="relative py-4 pl-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800 text-xs text-gray-400">
                                                <Car className="w-3 h-3" />
                                                <span>이동</span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
