import type { Route } from "./+types/trips.$tripId";
import { useLoaderData, Link, useFetcher } from "react-router";
import { db } from "~/db";
import { trips, tripItems, places, userSwipes } from "~/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { useState, useEffect } from "react";
import { HybridMapContainer } from "~/components/map/HybridMapContainer";
import { UnifiedMarker } from "~/components/map/UnifiedMarker";
import { DirectionsOptimizer } from "~/components/map/DirectionsOptimizer";
import { isKoreanRegion } from "~/lib/map-utils";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Car, Share2, Edit2, Check, X } from "lucide-react";
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
    const fetcher = useFetcher();

    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renameValue, setRenameValue] = useState(trip.title);

    // Update renameValue if trip title changes from server (after successful update)
    useEffect(() => {
        setRenameValue(trip.title);
    }, [trip.title]);

    const handleRenameSubmit = () => {
        if (!renameValue.trim()) {
            toast.error("제목을 입력해주세요.");
            return;
        }
        if (renameValue === trip.title) {
            setIsRenameModalOpen(false);
            return;
        }

        fetcher.submit(
            { tripId: trip.id, title: renameValue.trim() },
            { method: "POST", action: "/api/trips/update" }
        );
        setIsRenameModalOpen(false);
    };

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
                <HybridMapContainer
                    center={places[0]?.coordinates || { lat: 37.5665, lng: 126.9780 }}
                    zoom={12}
                    className="w-full h-full"
                >
                    {places.map((p, index) => (
                        <UnifiedMarker
                            key={p.id}
                            position={p.coordinates}
                            title={p.name}
                            isFirst={index === 0}
                        />
                    ))}

                    {!isKoreanRegion(
                        places[0]?.coordinates?.lat || 37.5665,
                        places[0]?.coordinates?.lng || 126.9780
                    ) && places.length >= 2 && (
                            <DirectionsOptimizer
                                places={places}
                                strokeColor="#25aff4"
                            />
                        )}
                </HybridMapContainer>
                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background-dark to-transparent pointer-events-none z-10" />
            </div>

            {/* Content Section */}
            <div className="flex-1 bg-background-dark -mt-6 rounded-t-3xl relative z-20 px-6 pt-8 pb-10 shadow-t-2xl shadow-black/50 overflow-hidden flex flex-col">
                <div className="flex flex-col gap-2 mb-8">
                    <div className="flex items-center justify-between group">
                        <h1
                            onClick={() => setIsRenameModalOpen(true)}
                            className="text-2xl font-bold cursor-pointer hover:text-white/80 transition-colors flex-1"
                        >
                            {trip.title}
                        </h1>
                        <button
                            onClick={() => setIsRenameModalOpen(true)}
                            className="p-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all outline-none"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                    </div>
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

            {/* Rename Modal */}
            <AnimatePresence>
                {isRenameModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsRenameModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm bg-surface-dark border border-white/10 rounded-[2rem] p-8 shadow-2xl"
                        >
                            <h2 className="text-xl font-bold mb-6">여행 계획 이름 변경</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">새 이름</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleRenameSubmit();
                                            if (e.key === "Escape") setIsRenameModalOpen(false);
                                        }}
                                        placeholder="여행 이름을 입력하세요"
                                        className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-primary/50 transition-all"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsRenameModalOpen(false)}
                                        className="flex-1 rounded-xl h-12 font-bold text-slate-400 hover:text-white"
                                    >
                                        취소
                                    </Button>
                                    <Button
                                        onClick={handleRenameSubmit}
                                        className="flex-1 rounded-xl h-12 font-bold bg-primary text-white shadow-lg shadow-primary/20"
                                    >
                                        변경하기
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}


