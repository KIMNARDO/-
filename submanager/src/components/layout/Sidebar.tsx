"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Bell,
  Settings,
  Search,
  HelpCircle,
  ChevronLeft,
  Layers,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
    tip: "전체 구독 현황과 월별 비용을 한눈에 확인하세요",
  },
  {
    href: "/dashboard/subscriptions",
    label: "구독 목록",
    icon: CreditCard,
    tip: "감지된 모든 구독 서비스를 관리합니다",
  },
  {
    href: "/dashboard/scan",
    label: "이메일 스캔",
    icon: Search,
    tip: "Gmail에서 새로운 구독 결제를 검색합니다",
  },
  {
    href: "/dashboard/notifications",
    label: "알림",
    icon: Bell,
    tip: "결제일 전 알림 내역을 확인하세요",
  },
  {
    href: "/dashboard/settings",
    label: "설정",
    icon: Settings,
    tip: "알림 설정, 연결 관리, 계정 설정",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight">
              SubManager
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-200 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>

              {/* Contextual Tooltip - appears on hover when collapsed or for help */}
              {hoveredItem === item.href && collapsed && (
                <div className="tooltip-enter absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                  <p className="whitespace-nowrap text-sm font-medium">
                    {item.label}
                  </p>
                  <p className="mt-0.5 whitespace-nowrap text-xs text-muted-foreground">
                    {item.tip}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Help Guide Button */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <Link
          href="/setup"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          {!collapsed && <span>설정 가이드</span>}
        </Link>
      </div>
    </aside>
  );
}
