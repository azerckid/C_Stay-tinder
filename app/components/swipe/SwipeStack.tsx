import React, { useState, useCallback } from "react";
import { AnimatePresence, useMotionValue } from "framer-motion";
import { SwipeCard } from "./SwipeCard";
import type { Destination } from "~/lib/mock-data";
import { Heart, X, RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";

interface SwipeStackProps {
    destinations: Destination[];
}

export const SwipeStack: React.FC<SwipeStackProps> = ({ destinations: initialDestinations }) => {
    const [stack, setStack] = useState<Destination[]>(initialDestinations);
    const [history, setHistory] = useState<Destination[]>([]);

    // 앞 카드의 드래그 x 값을 MotionValue로 관리하여 배경 카드와 공유
    const dragX = useMotionValue(0);

    const handleSwipe = useCallback((direction: "left" | "right" | "up") => {
        if (stack.length === 0) return;

        const [current, ...remaining] = stack;
        setHistory(prev => [current, ...prev]);

        // 마지막 카드를 넘기면 다시 처음부터 스택을 채움 (무한 루프)
        if (remaining.length === 0) {
            setStack(initialDestinations);
        } else {
            setStack(remaining);
        }

        dragX.set(0);
    }, [stack, dragX, initialDestinations]);

    const handleUndo = () => {
        if (history.length > 0) {
            const [last, ...prevHistory] = history;
            setStack([last, ...stack]);
            setHistory(prevHistory);
        }
    };

    return (
        <div className="flex flex-col items-center justify-between w-full h-full max-w-md mx-auto relative group">
            {/* Card Stack Area - Fill up space */}
            <div className="relative w-full flex-1 flex flex-col mt-4 mb-2 z-10 min-h-0">
                <AnimatePresence mode="popLayout" initial={false}>
                    {stack.map((dest, idx) => {
                        // 성능을 위해 상위 3개만 렌더링하도록 맵 내부에서 필터링
                        if (idx >= 3) return null;

                        // 뒤에 있는 카드가 아래에서 렌더링되게 하기 위해 역순 인덱스 계산
                        const realIndex = idx;
                        return (
                            <SwipeCard
                                key={`${dest.id}-${stack.length}-${idx}`} // 루프 시 애니메이션 재트리거를 위해 키 조합 최적화
                                destination={dest}
                                onSwipe={handleSwipe}
                                isFront={realIndex === 0}
                                index={realIndex}
                                dragX={realIndex === 0 ? dragX : dragX}
                            />
                        );
                    }).reverse()}
                </AnimatePresence>
            </div>

            {/* Action Buttons - Floating Style as per Stitch */}
            <div className="absolute bottom-8 flex items-center justify-center w-full gap-6 z-30 px-4">
                {/* Pass Button */}
                <button
                    onClick={() => handleSwipe("left")}
                    className="flex items-center justify-center size-14 rounded-full bg-surface-dark border border-white/5 text-rose-500 shadow-xl active:scale-95 transition-all"
                >
                    <X className="w-8 h-8" />
                </button>

                {/* Info or Undo Button */}
                <button
                    onClick={handleUndo}
                    className="flex items-center justify-center size-10 rounded-full bg-surface-dark/80 backdrop-blur shadow-md text-slate-400 hover:text-white transition-all active:scale-90 disabled:opacity-30"
                    disabled={history.length === 0}
                >
                    <RotateCcw className="w-5 h-5" />
                </button>

                {/* Like Button */}
                <button
                    onClick={() => handleSwipe("right")}
                    className="flex items-center justify-center size-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 active:scale-110 transition-all"
                >
                    <Heart className="w-8 h-8 fill-current" />
                </button>
            </div>
        </div>
    );
};
