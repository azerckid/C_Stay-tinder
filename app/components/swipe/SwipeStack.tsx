import React, { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { SwipeCard } from "./SwipeCard";
import type { Destination } from "~/lib/mock-data";
import { Heart, X, RotateCcw, Info } from "lucide-react";
import { Button } from "~/components/ui/button";

interface SwipeStackProps {
    destinations: Destination[];
}

export const SwipeStack: React.FC<SwipeStackProps> = ({ destinations: initialDestinations }) => {
    const [stack, setStack] = useState<Destination[]>(initialDestinations);
    const [history, setHistory] = useState<Destination[]>([]);

    const handleSwipe = useCallback((direction: "left" | "right" | "up") => {
        if (stack.length === 0) return;
        const [current, ...remaining] = stack;
        setHistory(prev => [current, ...prev]);
        setStack(remaining);
    }, [stack]);

    const handleUndo = () => {
        if (history.length > 0) {
            const [last, ...prevHistory] = history;
            setStack([last, ...stack]);
            setHistory(prevHistory);
        }
    };

    return (
        <div className="flex flex-col items-center justify-between w-full h-full max-w-md mx-auto relative group">
            {/* Background Stack Decoration (Stitch Style) */}
            <div className="absolute inset-0 top-0 bottom-32 flex flex-col items-center pointer-events-none">
                <div className="absolute w-[90%] h-[75%] top-[8%] bg-surface-dark rounded-[2.5rem] opacity-20 scale-90 translate-y-8 shadow-lg z-0 transition-all duration-500"></div>
                <div className="absolute w-[95%] h-[80%] top-[4%] bg-surface-dark rounded-[2.5rem] opacity-40 scale-[0.96] translate-y-4 shadow-lg z-0 transition-all duration-500"></div>
            </div>

            {/* Card Stack Area - Fill up space */}
            <div className="relative w-full flex-1 flex flex-col mt-4 mb-2 z-10 min-h-0">
                <AnimatePresence mode="popLayout">
                    {stack.length > 0 ? (
                        <SwipeCard
                            key={stack[0].id}
                            destination={stack[0]}
                            onSwipe={handleSwipe}
                            isFront={true}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-dark/30 rounded-[2.5rem] border-2 border-dashed border-white/10 text-center p-8 z-10">
                            <h3 className="text-2xl font-bold text-white mb-2 font-display uppercase tracking-tight">Out of places!</h3>
                            <p className="text-text-secondary mb-8 text-sm">You've explored all destinations for now.</p>
                            <Button
                                onClick={() => setStack(initialDestinations)}
                                variant="outline"
                                className="rounded-full border-primary text-primary hover:bg-primary/10 px-8 py-6 h-auto"
                            >
                                Reset Stack
                            </Button>
                        </div>
                    )}
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
