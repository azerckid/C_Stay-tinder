import type { Route } from "./+types/trips.index";
import { Link, useLoaderData, useFetcher, type ActionFunctionArgs } from "react-router";
import { db } from "~/db";
import { trips, tripItems, places } from "~/db/schema";
import { auth } from "~/lib/auth";
import { eq, desc, sql, and } from "drizzle-orm";
import { ArrowLeft, Calendar, MapPin, ChevronRight, Plane, Trash2, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "DELETE") {
        return new Response("Method not allowed", { status: 405 });
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const tripId = formData.get("tripId") as string;

    if (!tripId) {
        return new Response("Trip ID is required", { status: 400 });
    }

    try {
        const deleted = await db
            .delete(trips)
            .where(and(eq(trips.id, tripId), eq(trips.userId, session.user.id)))
            .returning({ id: trips.id });

        if (deleted.length === 0) {
            return new Response("Trip not found or unauthorized", { status: 404 });
        }

        return { success: true, deletedId: deleted[0].id };
    } catch (e) {
        console.error("Failed to delete trip:", e);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function loader({ request }: Route.LoaderArgs) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return { trips: [] };

    // 여행 목록과 각 여행에 포함된 장소 개수 조회
    const myTrips = await db
        .select({
            id: trips.id,
            title: trips.title,
            startDate: trips.startDate,
            endDate: trips.endDate,
            status: trips.status,
            createdAt: trips.createdAt,
            placeCount: sql<number>`count(${tripItems.id})`,
            thumbnailUrl: sql<string>`min(${places.imageUrl})`, // 첫 번째 장소 이미지를 썸네일로
        })
        .from(trips)
        .leftJoin(tripItems, eq(trips.id, tripItems.tripId))
        .leftJoin(places, eq(tripItems.placeId, places.id))
        .where(eq(trips.userId, session.user.id))
        .groupBy(trips.id)
        .orderBy(desc(trips.createdAt));

    return { trips: myTrips };
}

export default function TripsIndexPage() {
    const { trips } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();

    const handleDelete = (e: React.MouseEvent, tripId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm("정말로 이 여행 계획을 삭제하시겠습니까?")) {
            fetcher.submit(
                { tripId },
                { method: "DELETE" }
            );
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-white font-sans max-w-md mx-auto flex flex-col">
            {/* Header */}
            <header className="px-6 py-6 flex items-center gap-4 border-b border-white/5 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
                <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-xl font-bold">My Trips</h1>
            </header>

            {/* Content */}
            <main className="flex-1 p-6">
                {trips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <Plane className="w-16 h-16 mb-4 text-slate-600" />
                        <p className="text-lg font-semibold">아직 생성된 여행이 없습니다.</p>
                        <p className="text-sm mt-2">마음에 들면 여행지를 담고<br />새로운 여행을 만들어보세요!</p>
                        <Link to="/" className="mt-8 px-6 py-3 bg-primary rounded-full font-bold text-white shadow-lg shadow-primary/30">
                            여행지 둘러보기
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {trips.map((trip) => (
                            <div key={trip.id} className="relative group">
                                <Link
                                    to={`/trips/${trip.id}`}
                                    className="flex items-center gap-4 p-4 bg-surface-dark rounded-2xl border border-white/5 active:scale-[0.98] transition-all hover:bg-surface-dark/80 pr-12"
                                >
                                    {/* Thumbnail */}
                                    <div className="size-20 shrink-0 rounded-xl bg-slate-800 overflow-hidden shadow-sm">
                                        {trip.thumbnailUrl ? (
                                            <img src={trip.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-slate-500">
                                                <MapPin className="w-8 h-8 opacity-50" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg truncate pr-2">{trip.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{trip.placeCount} Places</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-slate-600" />
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>
                                                    {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors ml-auto" />
                                </Link>

                                {/* More Options Menu */}
                                <div className="absolute top-4 right-2 z-10">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-90 outline-none">
                                            <MoreVertical className="w-5 h-5" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-32 bg-[#1a262e] border border-white/10 text-white rounded-xl shadow-2xl p-1.5 overflow-hidden">
                                            <DropdownMenuItem
                                                onClick={(e) => handleDelete(e, trip.id)}
                                                variant="destructive"
                                                className="text-rose-500 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer flex items-center gap-2.5 p-2 rounded-lg transition-colors font-medium outline-none"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>삭제하기</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
