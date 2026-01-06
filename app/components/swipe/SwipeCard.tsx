import React, { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from "framer-motion";
import type { Destination } from "~/lib/mock-data";
import { Heart, X, Star, MapPin } from "lucide-react";

interface SwipeCardProps {
    destination: Destination;
    onSwipe: (direction: "left" | "right" | "up") => void;
    isFront: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ destination, onSwipe, isFront }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

    // Swipe indicator opacities
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

    const controls = useAnimation();

    const handleDragEnd = async (_: any, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            await controls.start({ x: 500, opacity: 0 });
            onSwipe("right");
        } else if (info.offset.x < -threshold) {
            await controls.start({ x: -500, opacity: 0 });
            onSwipe("left");
        } else {
            controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
        }
    };

    if (!isFront) {
        return null; // SwipeStack에서 배경 카드를 별도로 렌더링하도록 변경
    }

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            style={{ x, y, rotate, opacity }}
            className="absolute inset-0 w-full h-full rounded-[2.5rem] overflow-hidden cursor-grab active:cursor-grabbing shadow-card-depth z-10"
        >
            {/* Card Image Background */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                style={{ backgroundImage: `url(${destination.imageUrl})` }}
            />

            {/* Gradient Overlays (Stitch style) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />

            {/* Swipe Indicators */}
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

            {/* Card Content (Bottom) */}
            <div className="absolute bottom-0 left-0 w-full p-8 pb-10 z-20 flex flex-col gap-3 pointer-events-none">
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
                            {destination.location}, {destination.country} • 4.5km away
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
