import type { Route } from "./+types/home";
import { Link, useLocation } from "react-router";
import { SwipeStack } from "~/components/swipe/SwipeStack";
import { MOCK_DESTINATIONS } from "~/lib/mock-data";
import { User, Home as HomeIcon, Heart, Map as MapIcon, Settings2, Compass } from "lucide-react";
import { useSelectedDestinations } from "~/lib/contexts/SelectedDestinationsContext";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "CSTAY Tinder - Discover Your Next Journey" },
    { name: "description", content: "Swipe to discover and plan your perfect trip." },
  ];
}

import { authClient } from "~/lib/auth-client";
import { LoginButton, LogoutButton } from "~/components/auth/AuthButtons";

export default function Home() {
  const location = useLocation();
  const { data: session } = authClient.useSession();
  const { selectedDestinations } = useSelectedDestinations();
  const isActive = (path: string) => location.pathname === path;

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

        <div className="flex items-center gap-3 pointer-events-auto">
          {!session ? (
            <LoginButton />
          ) : (
            <div className="flex items-center gap-2 bg-surface-dark/40 backdrop-blur-xl border border-white/10 rounded-full p-1 pr-2 shadow-lg">
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name} className="size-8 rounded-full object-cover" />
              ) : (
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                  {session.user.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-medium max-w-[80px] truncate hidden sm:block">{session.user.name}</span>
              <LogoutButton />
            </div>
          )}

          <button className="flex items-center justify-center size-10 rounded-full bg-surface-dark/40 backdrop-blur-xl border border-white/10 text-slate-300 hover:text-white transition-all shadow-lg active:scale-90">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content: Swipe Area - Full-screen filling logic */}
      <main className="flex-1 relative w-full max-w-md mx-auto min-h-0">
        <SwipeStack destinations={MOCK_DESTINATIONS} />
      </main>

      {/* Bottom Navigation Bar - Stitch Themed */}
      <nav className="shrink-0 bg-[#0d161b]/95 backdrop-blur-md border-t border-white/5 pb-[env(safe-area-inset-bottom,20px)] pt-3 z-40">
        <div className="flex items-center justify-around px-4 pb-2">
          {/* Home Tab */}
          <Link
            to="/"
            className={`flex flex-col items-center gap-1.5 p-2 min-w-[64px] transition-all group ${isActive("/") ? "text-primary" : "text-slate-500 hover:text-slate-300"
              }`}
          >
            <div className="relative">
              <HomeIcon className="w-6 h-6 transition-transform group-active:scale-90" />
              {isActive("/") && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </div>
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
            <MapIcon className="w-6 h-6 transition-transform group-active:scale-90" />
            {selectedDestinations.length > 0 && (
              <div className="absolute top-0 right-0 size-2 bg-primary rounded-full" />
            )}
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
