"use client";

import { useState } from "react";
import {
  Plus,
  Filter,
  X,
  Check,
} from "lucide-react";
import SubscriptionRow from "@/components/dashboard/SubscriptionRow";
import Tooltip from "@/components/layout/Tooltip";
import type { Subscription } from "@/types";

// Demo data — same as dashboard for now
const DEMO_SUBSCRIPTIONS: Subscription[] = [
  { id: "1", user_id: "u1", service_name: "OpenAI API", amount: 20, currency: "USD", billing_cycle: "monthly", next_payment_date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0], status: "active", category: "ai", created_at: "", updated_at: "" },
  { id: "2", user_id: "u1", service_name: "Claude Pro", amount: 20, currency: "USD", billing_cycle: "monthly", next_payment_date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0], status: "active", category: "ai", created_at: "", updated_at: "" },
  { id: "3", user_id: "u1", service_name: "AWS", amount: 45.3, currency: "USD", billing_cycle: "monthly", next_payment_date: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0], status: "active", category: "cloud", created_at: "", updated_at: "" },
  { id: "4", user_id: "u1", service_name: "Vercel Pro", amount: 20, currency: "USD", billing_cycle: "monthly", next_payment_date: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0], status: "active", category: "cloud", created_at: "", updated_at: "" },
  { id: "5", user_id: "u1", service_name: "Figma", amount: 15, currency: "USD", billing_cycle: "monthly", next_payment_date: new Date(Date.now() + 18 * 86400000).toISOString().split("T")[0], status: "active", category: "saas", created_at: "", updated_at: "" },
  { id: "6", user_id: "u1", service_name: "Notion", amount: 10, currency: "USD", billing_cycle: "monthly", next_payment_date: new Date(Date.now() + 22 * 86400000).toISOString().split("T")[0], status: "active", category: "saas", created_at: "", updated_at: "" },
  { id: "7", user_id: "u1", service_name: "GitHub Copilot", amount: 10, currency: "USD", billing_cycle: "monthly", next_payment_date: new Date(Date.now() + 8 * 86400000).toISOString().split("T")[0], status: "active", category: "ai", created_at: "", updated_at: "" },
  { id: "8", user_id: "u1", service_name: "Supabase Pro", amount: 25, currency: "USD", billing_cycle: "monthly", next_payment_date: new Date(Date.now() + 25 * 86400000).toISOString().split("T")[0], status: "paused", category: "cloud", created_at: "", updated_at: "" },
];

type FilterStatus = "all" | Subscription["status"];
type FilterCategory = "all" | Subscription["category"];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(DEMO_SUBSCRIPTIONS);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = subscriptions.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    return true;
  });

  const handleStatusChange = (id: string, status: Subscription["status"]) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "active", label: "활성" },
    { value: "paused", label: "홀딩" },
    { value: "cancelled", label: "해지" },
  ];

  const categoryFilters: { value: FilterCategory; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "ai", label: "AI" },
    { value: "api", label: "API" },
    { value: "cloud", label: "Cloud" },
    { value: "saas", label: "SaaS" },
    { value: "entertainment", label: "엔터" },
    { value: "other", label: "기타" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">구독 목록</h1>
            <Tooltip content="이메일에서 자동 감지된 구독과 직접 추가한 구독이 모두 표시됩니다" />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filtered.length}개 서비스
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          직접 추가
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">상태:</span>
          <div className="flex gap-1">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">카테고리:</span>
          <div className="flex gap-1">
            {categoryFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setCategoryFilter(f.value)}
                className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                  categoryFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-12 text-center">
            <p className="text-sm text-muted-foreground">
              조건에 맞는 구독이 없습니다
            </p>
          </div>
        ) : (
          filtered.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              subscription={sub}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddSubscriptionModal onClose={() => setShowAddModal(false)} onAdd={(sub) => {
          setSubscriptions(prev => [...prev, { ...sub, id: String(prev.length + 1), user_id: "u1", created_at: "", updated_at: "" }]);
          setShowAddModal(false);
        }} />
      )}
    </div>
  );
}

function AddSubscriptionModal({ onClose, onAdd }: { onClose: () => void; onAdd: (sub: Omit<Subscription, "id" | "user_id" | "created_at" | "updated_at">) => void }) {
  const [form, setForm] = useState({
    service_name: "",
    amount: "",
    currency: "USD",
    billing_cycle: "monthly" as Subscription["billing_cycle"],
    next_payment_date: "",
    category: "other" as Subscription["category"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service_name || !form.amount) return;
    onAdd({
      ...form,
      amount: parseFloat(form.amount),
      status: "active",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="tooltip-enter w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">구독 직접 추가</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">서비스 이름</label>
            <input
              type="text"
              value={form.service_name}
              onChange={(e) => setForm(f => ({ ...f, service_name: e.target.value }))}
              placeholder="예: OpenAI, AWS, Netflix"
              className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">금액</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="20.00"
                className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">통화</label>
              <select
                value={form.currency}
                onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="KRW">KRW (₩)</option>
                <option value="EUR">EUR</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">결제 주기</label>
              <select
                value={form.billing_cycle}
                onChange={(e) => setForm(f => ({ ...f, billing_cycle: e.target.value as Subscription["billing_cycle"] }))}
                className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="monthly">월간</option>
                <option value="yearly">연간</option>
                <option value="weekly">주간</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">카테고리</label>
              <select
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value as Subscription["category"] }))}
                className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="ai">AI</option>
                <option value="api">API</option>
                <option value="cloud">Cloud</option>
                <option value="saas">SaaS</option>
                <option value="entertainment">엔터테인먼트</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">다음 결제일</label>
            <input
              type="date"
              value={form.next_payment_date}
              onChange={(e) => setForm(f => ({ ...f, next_payment_date: e.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Check className="h-4 w-4" />
            추가
          </button>
        </form>
      </div>
    </div>
  );
}
