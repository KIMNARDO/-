"use client";

import { Bell, Search, User, LogOut } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  upcomingCount?: number;
}

export default function Header({
  userName = "사용자",
  userEmail = "",
  upcomingCount = 0,
}: HeaderProps) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="구독 서비스 검색..."
          className="h-9 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          {upcomingCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
              {upcomingCount > 9 ? "9+" : upcomingCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="hidden sm:inline">{userName}</span>
          </button>

          {showProfile && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfile(false)}
              />
              <div className="tooltip-enter absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-card p-1 shadow-xl">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                <div className="my-1 h-px bg-border" />
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
