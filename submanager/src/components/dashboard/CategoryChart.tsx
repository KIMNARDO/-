"use client";

import type { Subscription } from "@/types";

interface CategoryData {
  category: string;
  label: string;
  amount: number;
  color: string;
  percentage: number;
}

const categoryConfig: Record<
  Subscription["category"],
  { label: string; color: string; bgColor: string }
> = {
  ai: { label: "AI 서비스", color: "#8b5cf6", bgColor: "bg-violet-500" },
  api: { label: "API", color: "#3b82f6", bgColor: "bg-blue-500" },
  saas: { label: "SaaS", color: "#10b981", bgColor: "bg-emerald-500" },
  entertainment: { label: "엔터테인먼트", color: "#ec4899", bgColor: "bg-pink-500" },
  cloud: { label: "클라우드", color: "#f97316", bgColor: "bg-orange-500" },
  other: { label: "기타", color: "#6b7280", bgColor: "bg-gray-500" },
};

interface CategoryChartProps {
  subscriptions: Subscription[];
}

export default function CategoryChart({
  subscriptions,
}: CategoryChartProps) {
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active"
  );

  const total = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);

  const categories: CategoryData[] = Object.entries(categoryConfig)
    .map(([key, config]) => {
      const amount = activeSubscriptions
        .filter((s) => s.category === key)
        .reduce((sum, s) => sum + s.amount, 0);
      return {
        category: key,
        label: config.label,
        amount,
        color: config.color,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">카테고리별 비용</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        활성 구독 기준 월간 지출
      </p>

      {/* Bar Chart */}
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted">
        {categories.map((c) => (
          <div
            key={c.category}
            className="transition-all duration-500"
            style={{
              width: `${c.percentage}%`,
              backgroundColor: c.color,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {categories.map((c) => (
          <div key={c.category} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium">
                ${c.amount.toLocaleString()}
              </span>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {c.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
