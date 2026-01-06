import type { Route } from "./+types/home";
import { SwipeStack } from "~/components/swipe/SwipeStack";
import { MOCK_DESTINATIONS } from "~/lib/mock-data";
import { User, Home as HomeIcon, Heart, Map as MapIcon, Settings2, Compass } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "CSTAY Tinder - Discover Your Next Journey" },
    { name: "description", content: "Swipe to discover and plan your perfect trip." },
  ];
}

export default function Home() {
  return (
    <div className="bg-background-dark text-white font-sans overflow-hidden h-screen flex flex-col">
      {/* Top Navigation - Immersive Floating Overlay */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-8 pb-4 z-50 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* App Logo / Icon with Glassmorphism */}
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary backdrop-blur-xl border border-white/10 shadow-lg">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight drop-shadow-md">Discover</h1>
        </div>
        <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark/40 backdrop-blur-xl border border-white/10 text-slate-300 hover:text-white transition-all pointer-events-auto shadow-lg active:scale-90">
          <Settings2 className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content: Swipe Area - Full-screen filling logic */}
      <main className="flex-1 relative w-full max-w-md mx-auto min-h-0">
        <SwipeStack destinations={MOCK_DESTINATIONS} />
      </main>

      {/* Bottom Navigation Bar - Stitch Themed */}
      <nav className="shrink-0 bg-[#0d161b]/95 backdrop-blur-md border-t border-white/5 pb-[env(safe-area-inset-bottom,20px)] pt-3 z-40">
        <div className="flex items-center justify-around px-4 pb-2">
          {/* Active Tab */}
          <a className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] text-primary group" href="#">
            <div className="relative">
              <HomeIcon className="w-6 h-6 transition-transform group-active:scale-90" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
            </div>
            <span className="text-[10px] font-bold tracking-wide">Home</span>
          </a>
          {/* Inactive Tabs */}
          <a className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] text-slate-500 hover:text-slate-300 transition-all group" href="#">
            <Heart className="w-6 h-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-medium tracking-wide">Saved</span>
          </a>
          <a className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] text-slate-500 hover:text-slate-300 transition-all group" href="#">
            <MapIcon className="w-6 h-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-medium tracking-wide">Itinerary</span>
          </a>
          <a className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] text-slate-500 hover:text-slate-300 transition-all group" href="#">
            <User className="w-6 h-6 transition-transform group-active:scale-90" />
            <span className="text-[10px] font-medium tracking-wide">Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
