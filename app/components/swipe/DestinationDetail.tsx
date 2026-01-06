import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Star, Heart, Share2, Navigation, Clock } from "lucide-react";
import type { Destination } from "~/lib/mock-data";
import { Button } from "~/components/ui/button";

interface DestinationDetailProps {
    destination: Destination;
    isOpen: boolean;
    onClose: () => void;
    onSwipe: (direction: "left" | "right") => void;
}

export const DestinationDetail: React.FC<DestinationDetailProps> = ({
    destination,
    isOpen,
    onClose,
    onSwipe
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[100] bg-background-dark flex flex-col overflow-y-auto no-scrollbar"
                >
                    {/* Hero Image Section */}
                    <div className="relative w-full h-[50vh] min-h-[400px] shrink-0">
                        <img
                            src={destination.imageUrl}
                            alt={destination.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background-dark" />

                        {/* Header Buttons */}
                        <div className="absolute top-12 left-6 right-6 flex justify-between items-center">
                            <button
                                onClick={onClose}
                                className="size-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <button className="size-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="relative -mt-12 px-6 pb-32 flex-1">
                        {/* Basic Info */}
                        <div className="flex flex-col gap-2 mb-6">
                            <div className="flex flex-wrap gap-2">
                                {destination.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                                        {tag.replace('#', '')}
                                    </span>
                                ))}
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold">
                                    <Star className="w-3 h-3 fill-current" />
                                    {destination.rating}
                                </div>
                            </div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">{destination.name}</h1>
                            <div className="flex items-center text-text-secondary gap-1.5">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">{destination.location}, {destination.country}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary rounded-full" />
                                장소 상세 내역
                            </h3>
                            <p className="text-text-secondary leading-relaxed text-sm">
                                {destination.description} 여기에 추가적인 장소 설명과 매력을 더 풍부하게 서술할 수 있습니다.
                                추천 방문 시간대나 근처 맛집 정보 등 사용자에게 유용한 팁을 제공합니다.
                            </p>
                        </div>

                        {/* Map Preview */}
                        <div className="mb-8">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary rounded-full" />
                                위치 확인
                            </h3>
                            <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/5 relative bg-surface-dark group">
                                <img
                                    src="/destinations/map_mockup.png"
                                    alt="Map preview"
                                    className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="size-12 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/50 flex items-center justify-center animate-pulse">
                                        <div className="size-4 rounded-full bg-primary shadow-[0_0_15px_#25aff4]" />
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    className="absolute bottom-4 right-4 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs h-9"
                                >
                                    <Navigation className="w-3.5 h-3.5 mr-1.5" />
                                    길찾기 시작
                                </Button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 rounded-3xl bg-surface-dark border border-white/5 flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">권장 관람</p>
                                    <p className="text-white font-bold text-sm">약 2시간</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-3xl bg-surface-dark border border-white/5 flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <Star className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">리뷰 수</p>
                                    <p className="text-white font-bold text-sm">{destination.reviewCount}+</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="fixed bottom-0 left-0 w-full p-6 pb-10 border-t border-white/5 bg-background-dark/80 backdrop-blur-xl flex flex-col gap-6 z-[110]">
                        <Button
                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-[0_8px_20px_-4px_rgba(37,175,244,0.4)] transition-all active:scale-[0.98]"
                            onClick={() => {
                                // 향후 /route 페이지로 이동하는 로직이 들어갈 자리입니다.
                                // 현재는 UI 프로토타입 단계이므로 알림창으로 대체하거나 빈 핸들러를 둡니다.
                                console.log("Navigating to route page...");
                                onClose();
                            }}
                        >
                            이곳을 포함한 동선 보기
                        </Button>

                        <div className="flex justify-center gap-8">
                            <button
                                onClick={() => { onSwipe("left"); onClose(); }}
                                className="size-16 rounded-full bg-surface-dark border border-white/5 text-rose-500 shadow-xl active:scale-90 transition-all flex items-center justify-center"
                            >
                                <X className="w-10 h-10" />
                            </button>
                            <button
                                onClick={() => { onSwipe("right"); onClose(); }}
                                className="size-16 rounded-full bg-primary text-white shadow-xl shadow-primary/30 active:scale-110 transition-all flex items-center justify-center"
                            >
                                <Heart className="w-10 h-10 fill-current" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
