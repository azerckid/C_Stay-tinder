import type { Route } from "./+types/route";
import { useNavigate, Link, useLocation, useLoaderData, useFetcher } from "react-router";
import { useSelectedDestinations } from "~/lib/contexts/SelectedDestinationsContext";
import { authClient } from "~/lib/auth-client";
import { ArrowLeft, Edit, Bookmark, Navigation, Car, MapPin, Clock, User, Home as HomeIcon, Heart, Map as MapIcon, X, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";
import { db } from "~/db";
import { places, userSwipes } from "~/db/schema";
import { auth } from "~/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { MapContainer } from "~/components/map/MapContainer";
import { DirectionsOptimizer } from "~/components/map/DirectionsOptimizer";
import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

export async function action({ request }: ActionFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const placeId = formData.get("placeId");
  const intent = formData.get("intent");

  if (intent === "delete" && typeof placeId === "string") {
    await db.delete(userSwipes)
      .where(and(
        eq(userSwipes.userId, session.user.id),
        eq(userSwipes.placeId, placeId)
      ));
    return { success: true };
  }

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return { likedPlaces: [] };
  }

  const liked = await db
    .select({
      id: places.id,
      name: places.name,
      location: places.location,
      country: places.country,
      imageUrl: places.imageUrl,
      tags: places.tags,
      description: places.description,
      lat: places.lat,
      lng: places.lng,
      rating: places.rating,
      reviewCount: places.reviewCount,
      swipedAt: userSwipes.createdAt,
    })
    .from(userSwipes)
    .innerJoin(places, eq(userSwipes.placeId, places.id))
    .where(and(eq(userSwipes.userId, session.user.id), eq(userSwipes.action, "like")))
    .orderBy(desc(userSwipes.createdAt));

  // 중복 제거 (최신 스와이프 기준)
  const uniqueMap = new Map();
  liked.forEach((item) => {
    if (!uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item);
    }
  });
  const uniqueLiked = Array.from(uniqueMap.values());

  const parsedLiked = uniqueLiked.map(p => ({
    ...p,
    tags: (p.tags as string[]) || [],
    imageUrl: p.imageUrl || "",
    coordinates: { lat: p.lat || 0, lng: p.lng || 0 }
  }));

  return { likedPlaces: parsedLiked };
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Travel Route - Recommended Itinerary" },
    { name: "description", content: "View your optimized travel route" },
  ];
}

import type { Destination } from "~/lib/mock-data";

function calculateRouteInfo(destinations: any[]) {
  const totalPlaces = destinations.length;
  const estimatedTimePerPlace = 2; // 시간
  const estimatedTravelTime = (totalPlaces > 0 ? totalPlaces - 1 : 0) * 0.5;
  const totalTime = totalPlaces * estimatedTimePerPlace + estimatedTravelTime;
  const totalDistance = totalPlaces * 4;

  return {
    totalPlaces,
    totalTime: Math.round(totalTime * 10) / 10,
    totalDistance,
  };
}

function getTransportInfo(index: number): { type: "car" | "walk"; time: number; label: string } {
  if (index === 0) return { type: "car", time: 15, label: "차량 15분 이동" };
  return { type: "walk", time: 10, label: "도보 10분 이동" };
}

function getTimeSlot(index: number, startHour: number = 10): { start: string; end: string } {
  const start = startHour + index * 2.5;
  const end = start + 2;
  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = hour % 1 === 0.5 ? "30" : "00";
    const period = h < 12 ? "오전" : "오후";
    const displayHour = h <= 12 ? h : h - 12;
    return `${period} ${displayHour}:${m}`;
  };
  return { start: formatTime(start), end: formatTime(end) };
}

function getCategoryColor(tag: string): string {
  if (!tag) return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";
  if (tag.includes("바다") || tag.includes("해변")) return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
  if (tag.includes("액티비티") || tag.includes("활기")) return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
  if (tag.includes("관광") || tag.includes("명소")) return "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400";
  return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";
}

export default function RoutePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { likedPlaces } = useLoaderData<typeof loader>();
  const { selectedDestinations, removeDestination } = useSelectedDestinations();
  const { data: session } = authClient.useSession();
  const fetcher = useFetcher();

  // DB 데이터(likedPlaces)와 로컬 컨텍스트 데이터(selectedDestinations)를 병합
  // 로그인한 경우 DB 데이터를 우선하고, 비로그인 시 로컬 데이터를 사용합니다.
  const displayPlaces = useMemo(() => {
    if (session) {
      // 로그인 시에는 DB가 우선이지만, 방금 스와이프한 로컬 데이터가 누락되었을 수 있으므로 병합
      const mergedMap = new Map();
      likedPlaces.forEach(p => mergedMap.set(p.id, p));
      selectedDestinations.forEach(p => {
        if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
      });
      return Array.from(mergedMap.values());
    }
    return selectedDestinations;
  }, [session, likedPlaces, selectedDestinations]);

  const handleRemovePlace = (placeId: string) => {
    if (confirm("이 장소를 경로에서 제외하시겠습니까?")) {
      // 1. 로컬 컨텍스트에서 제거
      removeDestination(placeId);

      // 2. 로그인 상태면 DB에서도 제거
      if (session) {
        fetcher.submit(
          { intent: "delete", placeId },
          { method: "POST" }
        );
      }
    }
  };

  // 거리 기반 최적 경로 정렬 (Nearest Neighbor Heuristic)
  const optimizeRoute = (places: typeof likedPlaces) => {
    if (places.length <= 2) return places;

    const sorted = [places[0]]; // 첫 번째 장소는 고정 (출발지)
    const remaining = [...places.slice(1)];

    while (remaining.length > 0) {
      const current = sorted[sorted.length - 1];
      let nearestIndex = 0;
      let minDist = Infinity;

      remaining.forEach((place, index) => {
        const dist = Math.sqrt(
          Math.pow(place.coordinates.lat - current.coordinates.lat, 2) +
          Math.pow(place.coordinates.lng - current.coordinates.lng, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearestIndex = index;
        }
      });

      sorted.push(remaining[nearestIndex]);
      remaining.splice(nearestIndex, 1);
    }
    return sorted;
  };

  // sortedPlaces를 useMemo로 메모이제이션하여 무한 루프 방지
  const sortedPlaces = useMemo(() => optimizeRoute(displayPlaces), [displayPlaces]);
  const routeInfo = calculateRouteInfo(sortedPlaces);

  const isActive = (path: string) => location.pathname === path;
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTrip = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/trips/create", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        toast.success("여행 계획이 저장되었습니다!", {
          description: "상세 페이지로 이동합니다.",
        });
        navigate(`/trips/${data.tripId}`); // 상세 페이지로 이동
      } else {
        toast.error("생성 실패", {
          description: "다시 시도해 주세요.",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("오류 발생", {
        description: "서버 연결을 확인해 주세요.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // 선택된 여행지가 없으면
  if (displayPlaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-dark text-white px-6">
        <p className="text-xl font-bold mb-4">아직 찜한 여행지가 없습니다</p>
        <p className="text-gray-400 mb-8 text-center">마음에 드는 장소를 Like 해주세요!</p>
        <Button onClick={() => navigate("/")} className="mt-4 bg-primary text-white">
          여행지 둘러보기
        </Button>
        {/* Bottom Navigation (Empty state에서도 보여줌) */}
        <nav className="fixed bottom-0 left-0 right-0 shrink-0 bg-[#0d161b]/95 backdrop-blur-md border-t border-white/5 pb-[env(safe-area-inset-bottom,20px)] pt-3 z-40">
          <div className="flex items-center justify-around px-4 pb-2">
            <Link to="/" className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] text-slate-500 hover:text-slate-300 transition-all group">
              <HomeIcon className="w-6 h-6" />
              <span className="text-[10px] font-medium tracking-wide">Home</span>
            </Link>
            <Link to="/" className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] text-slate-500 hover:text-slate-300 transition-all group">
              <Heart className="w-6 h-6" />
              <span className="text-[10px] font-medium tracking-wide">Saved</span>
            </Link>
            <Link to="/route" className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] text-primary transition-all group">
              <div className="relative">
                <MapIcon className="w-6 h-6" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              </div>
              <span className="text-[10px] font-bold tracking-wide">Itinerary</span>
            </Link>
            <Link to="/" className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] text-slate-500 hover:text-slate-300 transition-all group">
              <User className="w-6 h-6" />
              <span className="text-[10px] font-medium tracking-wide">Profile</span>
            </Link>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-background-dark text-white">
      {/* Top Navigation (Transparent Overlay) */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-12 pb-4 px-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate("/")}
          className="pointer-events-auto flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="pointer-events-auto flex items-center gap-3">
          <button className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors">
            <Edit className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="relative h-[45vh] w-full shrink-0">
        <MapContainer
          center={sortedPlaces[0]?.coordinates || { lat: 37.5665, lng: 126.9780 }}
          zoom={12}
          className="w-full h-full"
        >
          {sortedPlaces.map((dest, index) => (
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
          {sortedPlaces.length >= 2 && (
            <DirectionsOptimizer
              places={sortedPlaces}
              strokeColor="#25aff4" // Design System Primary
            />
          )}
        </MapContainer>
        {/* Gradients Overlay for smooth transition */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background-dark to-transparent pointer-events-none z-10" />
      </div>

      {/* Bottom Sheet / Route List */}
      <div className="flex-1 -mt-6 relative z-20 bg-background-dark rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden">
        {/* Handle */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
        </div>

        {/* Header Info */}
        <div className="px-6 pt-2 pb-4 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white leading-tight">여행 요약</h2>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
              <MapPin className="w-4 h-4" />
              {routeInfo.totalPlaces}곳
            </span>
            <span>•</span>
            <span>총 {routeInfo.totalTime}시간</span>
            <span>•</span>
            <span>{routeInfo.totalDistance}km</span>
          </div>
        </div>

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
          <div className="relative pl-4 border-l-2 border-dashed border-gray-800 space-y-8">
            {sortedPlaces.map((dest, index) => {
              const isFirst = index === 0;
              const transport = getTransportInfo(index);
              const timeSlot = getTimeSlot(index);
              const categoryTag = dest.tags[0] || "#관광명소";

              return (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group/card"
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[25px] top-0 size-5 rounded-full border-4 border-background-dark shadow-sm z-10 ${isFirst ? "bg-primary" : "bg-gray-600"
                      }`}
                  />

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{dest.name}</h3>
                        <p className="text-sm text-gray-400">
                          {timeSlot.start} - {timeSlot.end}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-semibold ${getCategoryColor(
                            categoryTag
                          )}`}
                        >
                          {categoryTag.replace("#", "")}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-90 outline-none">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 bg-[#1a262e] border border-white/10 text-white rounded-xl shadow-2xl p-1.5 z-50">
                            <DropdownMenuItem
                              onClick={() => handleRemovePlace(dest.id)}
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

                    {/* Card Content */}
                    <div className="flex gap-4 p-3 bg-surface-dark rounded-xl shadow-sm border border-gray-800">
                      <div className="size-16 shrink-0 rounded-lg bg-gray-200 overflow-hidden">
                        <img
                          className="h-full w-full object-cover"
                          src={dest.imageUrl}
                          alt={dest.name}
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-xs text-gray-400 line-clamp-2">{dest.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Transport Connector */}
                  {index < sortedPlaces.length - 1 && (
                    <div className="relative py-2 pl-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 text-xs font-medium text-gray-300 border border-gray-700">
                        {transport.type === "car" ? (
                          <Car className="w-3.5 h-3.5" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5" />
                        )}
                        {transport.label}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* End Spacer */}
            <div className="h-10" />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 bg-background-dark border-t border-gray-800">
        <Button
          onClick={handleCreateTrip}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Navigation className="w-5 h-5" />
          {isCreating ? "생성 중..." : "동선 생성하기 (Save Trip)"}
        </Button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="shrink-0 bg-[#0d161b]/95 backdrop-blur-md border-t border-white/5 pb-[env(safe-area-inset-bottom,20px)] pt-3 z-40">
        <div className="flex items-center justify-around px-4 pb-2">
          {/* Home Tab */}
          <Link
            to="/"
            className={`flex flex-col items-center gap-1.5 p-2 min-w-[64px] transition-all group ${isActive("/") ? "text-primary" : "text-slate-500 hover:text-slate-300"
              }`}
          >
            <HomeIcon className="w-6 h-6 transition-transform group-active:scale-90" />
            <span className={`text-[10px] tracking-wide ${isActive("/") ? "font-bold" : "font-medium"}`}>
              Home
            </span>
          </Link>
          {/* Saved Tab */}
          <Link
            to="/"
            className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] text-slate-500 hover:text-slate-300 transition-all group"
          >
            <Heart className="w-6 h-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-medium tracking-wide">Saved</span>
          </Link>
          {/* Itinerary Tab */}
          <Link
            to="/route"
            className={`flex flex-col items-center gap-1.5 p-2 min-w-[64px] transition-all group relative ${isActive("/route") ? "text-primary" : "text-slate-500 hover:text-slate-300"
              }`}
          >
            <div className="relative">
              <MapIcon className="w-6 h-6 transition-transform group-active:scale-90" />
              {isActive("/route") && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </div>
            <span className={`text-[10px] tracking-wide ${isActive("/route") ? "font-bold" : "font-medium"}`}>
              Itinerary
            </span>
          </Link>
          {/* Profile Tab */}
          <Link
            to="/"
            className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] text-slate-500 hover:text-slate-300 transition-all group"
          >
            <User className="w-6 h-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-medium tracking-wide">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
