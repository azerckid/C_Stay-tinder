import type { Route } from "./+types/trips.index";
import { Link, useLoaderData, useFetcher, type ActionFunctionArgs } from "react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { db } from "~/db";
import { trips, tripItems, places } from "~/db/schema";
import { auth } from "~/lib/auth";
import { eq, desc, sql, and } from "drizzle-orm";
import { ArrowLeft, Calendar, MapPin, ChevronRight, Plane, Trash2, MoreVertical, Edit2 } from "lucide-react";
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

    const [renameModal, setRenameModal] = useState<{ isOpen: boolean; id: string; currentTitle: string }>({
        isOpen: false,
        id: "",
        currentTitle: "",
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string }>({
        isOpen: false,
        id: "",
    });
    const [renameValue, setRenameValue] = useState("");

    const handleRenameClick = (e: React.MouseEvent, tripId: string, currentTitle: string) => {
        e.preventDefault();
        e.stopPropagation();
        setRenameModal({ isOpen: true, id: tripId, currentTitle });
        setRenameValue(currentTitle);
    };

    const handleRenameSubmit = () => {
        if (renameValue.trim() && renameValue !== renameModal.currentTitle) {
            fetcher.submit(
                { tripId: renameModal.id, title: renameValue.trim() },
                { method: "POST", action: "/api/trips/update" }
            );
        }
        setRenameModal({ ...renameModal, isOpen: false });
    };

    const handleDeleteClick = (e: React.MouseEvent, tripId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({ isOpen: true, id: tripId });
    };

    const handleDeleteSubmit = () => {
        if (deleteModal.id) {
            fetcher.submit(
                { tripId: deleteModal.id },
                { method: "DELETE" }
            );
        }
        setDeleteModal({ isOpen: false, id: "" });
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
                                                onClick={(e) => handleRenameClick(e, trip.id, trip.title)}
                                                className="focus:text-white focus:bg-white/10 cursor-pointer flex items-center gap-2.5 p-2 rounded-lg transition-colors font-medium outline-none"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                <span>이름 변경</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => handleDeleteClick(e, trip.id)}
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

            {/* Deletion Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm bg-surface-dark border border-white/10 rounded-[2rem] p-8 shadow-2xl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="size-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
                                    <Trash2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-xl font-bold mb-2">여행 계획 삭제</h2>
                                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                    정말로 이 여행 계획을 삭제하시겠습니까?<br />
                                    삭제된 계획은 다시 복구할 수 없습니다.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                        className="flex-1 rounded-xl h-12 font-bold text-slate-400 hover:text-white"
                                    >
                                        취소
                                    </Button>
                                    <Button
                                        onClick={handleDeleteSubmit}
                                        className="flex-1 rounded-xl h-12 font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                    >
                                        삭제하기
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rename Modal */}
            <AnimatePresence>
                {renameModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setRenameModal({ ...renameModal, isOpen: false })}
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
                                            if (e.key === "Escape") setRenameModal({ ...renameModal, isOpen: false });
                                        }}
                                        placeholder="여행 이름을 입력하세요"
                                        className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-primary/50 transition-all"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setRenameModal({ ...renameModal, isOpen: false })}
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

