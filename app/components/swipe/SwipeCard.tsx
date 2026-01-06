import React from "react";
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo, type MotionValue } from "framer-motion";
import type { Destination } from "~/lib/mock-data";
import { Heart, X, Star, MapPin } from "lucide-react";

interface SwipeCardProps {
    destination: Destination;
    onSwipe: (direction: "left" | "right" | "up") => void;
    isFront: boolean;
    index: number; // 스택 내 순서 (0: 맨 앞)
    dragX?: MotionValue<number>; // 앞 카드의 드래그 값 공유
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ destination, onSwipe, isFront, index, dragX }) => {
    // 내부 x, y 값 (isFront가 아닐 때는 0으로 고정)
    const x = dragX || useMotionValue(0);
    const y = useMotionValue(0);

    // 앞 카드 전용 변환
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

    // 배경 카드 효과 (앞 카드가 좌우로 200px 이상 밀릴 때 100% 변화)
    const absX = useTransform(x, (v) => Math.min(Math.abs(v), 200));

    // 스택 위치에 따른 기본값 설정
    const baseScale = index === 1 ? 0.96 : index === 2 ? 0.92 : 1;
    const baseTranslateY = index === 1 ? 16 : index === 2 ? 32 : 0;
    const baseBlur = index === 1 ? 2 : index === 2 ? 4 : 0;
    const baseOpacity = index === 1 ? 0.6 : index === 2 ? 0.3 : 1;

    // 드래그에 따른 동적 변화
    const scale = useTransform(absX, [0, 200], [baseScale, isFront ? 1 : (index === 1 ? 1 : 0.96)]);
    const translateY = useTransform(absX, [0, 200], [baseTranslateY, isFront ? 0 : (index === 1 ? 0 : 16)]);
    const blur = useTransform(absX, [0, 200], [baseBlur, isFront ? 0 : (index === 1 ? 0 : 2)]);
    const cardOpacity = useTransform(absX, [0, 200], [baseOpacity, isFront ? 1 : (index === 1 ? 1 : 0.6)]);

    // Swipe indicator opacities
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

    const controls = useAnimation();

    const handleDragEnd = async (_: any, info: PanInfo) => {
        if (!isFront) return;

        const threshold = 120;
        if (info.offset.x > threshold) {
            await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
            onSwipe("right");
            x.set(0); // 다음 카드를 위해 원복
        } else if (info.offset.x < -threshold) {
            await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
            onSwipe("left");
            x.set(0); // 다음 카드를 위해 원복
        } else {
            controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
        }
    };

    return (
        <motion.div
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            style={{
                x: isFront ? x : 0,
                y: isFront ? y : translateY,
                rotate: isFront ? rotate : 0,
                opacity: isFront ? opacity : cardOpacity,
                scale: isFront ? 1 : scale,
                filter: `blur(${isFront ? 0 : blur}px)`,
                zIndex: 10 - index
            }}
            className={`absolute inset-0 w-full h-full rounded-[2.5rem] overflow-hidden shadow-card-depth ${isFront ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
        >
            {/* Card Image Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${destination.imageUrl})` }}
            />

            {/* Gradient Overlays (Stitch style) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90" />

            {/* Swipe Indicators (Front Card Only) */}
            {isFront && (
                <>
                    <motion.div
                        style={{ opacity: nopeOpacity }}
                        className="absolute top-10 left-10 border-4 border-rose-500 rounded-lg px-4 py-1 -rotate-12 pointer-events-none z-30"
                    >
                        <span className="text-rose-500 text-2xl font-bold tracking-widest uppercase">NOPE</span>
                    </motion.div>

                    <motion.div
                        style={{ opacity: likeOpacity }}
                        className="absolute top-10 right-10 border-4 border-green-500 rounded-lg px-4 py-1 rotate-12 pointer-events-none z-30"
                    >
                        <span className="text-green-500 text-2xl font-bold tracking-widest uppercase">LIKE</span>
                    </motion.div>
                </>
            )}

            {/* Card Content (Bottom) */}
            <div className={`absolute bottom-0 left-0 w-full p-8 pb-10 z-20 flex flex-col gap-3 pointer-events-none transition-opacity duration-300 ${isFront ? 'opacity-100' : 'opacity-0'}`}>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-1">
                    {destination.tags.slice(0, 2).map((tag) => (
                        <div key={tag} className="flex items-center px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-sm">
                            <span className="text-xs font-bold text-white tracking-wide">{tag}</span>
                        </div>
                    ))}
                </div>

                {/* Title & Location */}
                <div>
                    <h2 className="text-[2.5rem] font-extrabold text-white leading-tight drop-shadow-2xl tracking-tight">
                        {destination.name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-2 text-white/90 font-medium">
                        <MapPin className="w-5 h-5 text-primary fill-primary/20" />
                        <span className="text-base tracking-wide">
                            {destination.location}, {destination.country}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
