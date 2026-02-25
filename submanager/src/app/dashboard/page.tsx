"use client";

import { useState } from "react";
import {
  DollarSign,
  CreditCard,
  CalendarClock,
  TrendingDown,
  Plus,
  Search,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import SubscriptionRow from "@/components/dashboard/SubscriptionRow";
import CategoryChart from "@/components/dashboard/CategoryChart";
import UpcomingPayments from "@/components/dashboard/UpcomingPayments";
import type { Subscription } from "@/types";

// Demo data — will be replaced with real data from Supabase + Gmail
const DEMO_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    user_id: "u1",
    service_name: "OpenAI API",
    amount: 20,
    currency: "USD",
    billing_cycle: "monthly",
    next_payment_date: new Date(Date.now() + 3 * 86400000)
      .toISOString()
      .split("T")[0],
    status: "active",
    category: "ai",
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    user_id: "u1",
    service_name: "Claude Pro",
    amount: 20,
    currency: "USD",
    billing_cycle: "monthly",
    next_payment_date: new Date(Date.now() + 5 * 86400000)
      .toISOString()
      .split("T")[0],
    status: "active",
    category: "ai",
    created_at: "",
    updated_at: "",
  },
  {
    id: "3",
    user_id: "u1",
    service_name: "AWS",
    amount: 45.3,
    currency: "USD",
    billing_cycle: "monthly",
    next_payment_date: new Date(Date.now() + 12 * 86400000)
      .toISOString()
      .split("T")[0],
    status: "active",
    category: "cloud",
    created_at: "",
    updated_at: "",
  },
  {
    id: "4",
    user_id: "u1",
    service_name: "Vercel Pro",
    amount: 20,
    currency: "USD",
    billing_cycle: "monthly",
    next_payment_date: new Date(Date.now() + 15 * 86400000)
      .toISOString()
      .split("T")[0],
    status: "active",
    category: "cloud",
    created_at: "",
    updated_at: "",
  },
  {
    id: "5",
    user_id: "u1",
    service_name: "Figma",
    amount: 15,
    currency: "USD",
    billing_cycle: "monthly",
    next_payment_date: new Date(Date.now() + 18 * 86400000)
      .toISOString()
      .split("T")[0],
    status: "active",
    category: "saas",
    created_at: "",
    updated_at: "",
  },
  {
    id: "6",
    user_id: "u1",
    service_name: "Notion",
    amount: 10,
    currency: "USD",
    billing_cycle: "monthly",
    next_payment_date: new Date(Date.now() + 22 * 86400000)
      .toISOString()
      .split("T")[0],
    status: "active",
    category: "saas",
    created_at: "",
    updated_at: "",
  },
  {
    id: "7",
    user_id: "u1",
    service_name: "GitHub Copilot",
    amount: 10,
    currency: "USD",
    billing_cycle: "monthly",
    next_payment_date: new Date(Date.now() + 8 * 86400000)
      .toISOString()
      .split("T")[0],
    status: "active",
    category: "ai",
    created_at: "",
    updated_at: "",
  },
  {
    id: "8",
    user_id: "u1",
    service_name: "Supabase Pro",
    amount: 25,
    currency: "USD",
    billing_cycle: "monthly",
    next_payment_date: new Date(Date.now() + 25 * 86400000)
      .toISOString()
      .split("T")[0],
    status: "paused",
    category: "cloud",
    created_at: "",
    updated_at: "",
  },
];

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(DEMO_SUBSCRIPTIONS);

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active"
  );
  const totalMonthly = activeSubscriptions.reduce(
    (sum, s) => sum + s.amount,
    0
  );
  const upcomingWeek = activeSubscriptions.filter((s) => {
    const days = Math.ceil(
      (new Date(s.next_payment_date).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    return days >= 0 && days <= 7;
  });

  const handleStatusChange = (
    id: string,
    status: Subscription["status"]
  ) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">대시보드</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            구독 현황을 한눈에 확인하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Search className="h-3.5 w-3.5" />
            이메일 스캔
          </button>
          <button className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            직접 추가
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="월 총 구독비"
          value={`$${totalMonthly.toFixed(2)}`}
          subtitle="지난달 대비 -8.2%"
          subtitleColor="success"
          icon={DollarSign}
          tooltip="현재 활성 상태인 구독의 월간 총 비용입니다"
        />
        <StatCard
          title="활성 구독"
          value={`${activeSubscriptions.length}개`}
          subtitle={`전체 ${subscriptions.length}개 중`}
          icon={CreditCard}
          tooltip="현재 결제가 진행 중인 구독 서비스 수입니다"
        />
        <StatCard
          title="이번 주 결제"
          value={`${upcomingWeek.length}건`}
          subtitle={`$${upcomingWeek.reduce((s, sub) => s + sub.amount, 0).toFixed(2)} 예정`}
          subtitleColor="warning"
          icon={CalendarClock}
          tooltip="7일 이내 결제 예정인 구독입니다. 불필요한 구독은 미리 해지하세요"
        />
        <StatCard
          title="절약 가능"
          value={`$${subscriptions.filter((s) => s.status === "paused").reduce((sum, s) => sum + s.amount, 0).toFixed(2)}`}
          subtitle="홀딩 중인 구독"
          subtitleColor="success"
          icon={TrendingDown}
          tooltip="홀딩 처리한 구독으로 절약하고 있는 금액입니다"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subscription List (2 cols) */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">전체 구독</h2>
            <span className="text-xs text-muted-foreground">
              {subscriptions.length}개 서비스
            </span>
          </div>
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <SubscriptionRow
                key={sub.id}
                subscription={sub}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>

        {/* Sidebar Widgets (1 col) */}
        <div className="space-y-4">
          <UpcomingPayments subscriptions={subscriptions} />
          <CategoryChart subscriptions={subscriptions} />
        </div>
      </div>
    </div>
  );
}
