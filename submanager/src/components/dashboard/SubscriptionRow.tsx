"use client";

import { ChevronRight, Pause, Trash2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { Subscription } from "@/types";

const categoryLabels: Record<Subscription["category"], string> = {
  ai: "AI",
  api: "API",
  saas: "SaaS",
  entertainment: "엔터",
  cloud: "Cloud",
  other: "기타",
};

const categoryColors: Record<Subscription["category"], string> = {
  ai: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  api: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  saas: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  entertainment: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  cloud: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  other: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

const statusLabels: Record<Subscription["status"], string> = {
  active: "활성",
  cancelled: "해지",
  paused: "홀딩",
};

const statusStyles: Record<Subscription["status"], string> = {
  active: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  paused: "bg-warning/10 text-warning",
};

interface SubscriptionRowProps {
  subscription: Subscription;
  onStatusChange?: (id: string, status: Subscription["status"]) => void;
}

export default function SubscriptionRow({
  subscription: sub,
  onStatusChange,
}: SubscriptionRowProps) {
  const [showActions, setShowActions] = useState(false);

  const daysUntilPayment = Math.ceil(
    (new Date(sub.next_payment_date).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  const urgencyClass =
    daysUntilPayment <= 3
      ? "text-destructive font-medium"
      : daysUntilPayment <= 7
        ? "text-warning"
        : "text-muted-foreground";

  return (
    <div className="card-interactive group flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
      {/* Left: Service Info */}
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
          {sub.service_name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{sub.service_name}</p>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${categoryColors[sub.category]}`}
            >
              {categoryLabels[sub.category]}
            </span>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[sub.status]}`}
            >
              {statusLabels[sub.status]}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {sub.billing_cycle === "monthly"
              ? "월간"
              : sub.billing_cycle === "yearly"
                ? "연간"
                : "주간"}{" "}
            결제
          </p>
        </div>
      </div>

      {/* Right: Amount + Date + Actions */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm font-semibold">
            {sub.currency === "KRW" ? "₩" : "$"}
            {sub.amount.toLocaleString()}
          </p>
          <p className={`text-xs ${urgencyClass}`}>
            {daysUntilPayment > 0
              ? `${daysUntilPayment}일 후 결제`
              : daysUntilPayment === 0
                ? "오늘 결제"
                : "결제 완료"}
          </p>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground transition-all"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showActions && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowActions(false)}
              />
              <div className="tooltip-enter absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-border bg-card p-1 shadow-xl">
                {sub.status !== "paused" && (
                  <button
                    onClick={() => {
                      onStatusChange?.(sub.id, "paused");
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    홀딩
                  </button>
                )}
                {sub.status === "paused" && (
                  <button
                    onClick={() => {
                      onStatusChange?.(sub.id, "active");
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-success hover:bg-accent transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                    재개
                  </button>
                )}
                <button
                  onClick={() => {
                    onStatusChange?.(sub.id, "cancelled");
                    setShowActions(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  해지
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
