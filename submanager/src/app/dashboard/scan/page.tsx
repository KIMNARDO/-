"use client";

import { useState } from "react";
import {
  Search,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
} from "lucide-react";
import Tooltip from "@/components/layout/Tooltip";
import type { DetectedSubscription } from "@/types";

// Demo scan results
const DEMO_RESULTS: DetectedSubscription[] = [
  { service_name: "OpenAI API", amount: 20, currency: "USD", billing_cycle: "monthly", category: "ai", source_email_subject: "Your OpenAI invoice", source_email_date: "2026-02-20", confidence: 0.95 },
  { service_name: "Anthropic (Claude)", amount: 20, currency: "USD", billing_cycle: "monthly", category: "ai", source_email_subject: "Claude Pro subscription receipt", source_email_date: "2026-02-18", confidence: 0.92 },
  { service_name: "AWS", amount: 45.3, currency: "USD", billing_cycle: "monthly", category: "cloud", source_email_subject: "AWS billing statement", source_email_date: "2026-02-15", confidence: 0.88 },
  { service_name: "Vercel", amount: 20, currency: "USD", billing_cycle: "monthly", category: "cloud", source_email_subject: "Vercel Pro invoice", source_email_date: "2026-02-12", confidence: 0.85 },
  { service_name: "GitHub Copilot", amount: 10, currency: "USD", billing_cycle: "monthly", category: "ai", source_email_subject: "GitHub Copilot payment receipt", source_email_date: "2026-02-10", confidence: 0.9 },
  { service_name: "Figma", amount: 15, currency: "USD", billing_cycle: "monthly", category: "saas", source_email_subject: "Your Figma invoice", source_email_date: "2026-02-08", confidence: 0.87 },
];

const confidenceLabel = (c: number) => {
  if (c >= 0.9) return { text: "높음", color: "text-success" };
  if (c >= 0.7) return { text: "보통", color: "text-warning" };
  return { text: "낮음", color: "text-muted-foreground" };
};

const categoryColors: Record<string, string> = {
  ai: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  api: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  saas: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cloud: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  entertainment: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  other: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<DetectedSubscription[] | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const handleScan = async () => {
    setScanning(true);
    setResults(null);
    // Simulate scan — in production, calls /api/gmail/scan
    await new Promise((r) => setTimeout(r, 2500));
    setResults(DEMO_RESULTS);
    setScanning(false);
  };

  const handleAdd = (name: string) => {
    setAdded((prev) => new Set(prev).add(name));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">이메일 스캔</h1>
          <Tooltip content="Gmail에서 구독/결제 관련 이메일을 검색하여 자동으로 구독 서비스를 감지합니다. 이메일 읽기만 하며 수정하지 않습니다." />
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Gmail에서 구독 결제 이메일을 자동으로 감지합니다
        </p>
      </div>

      {/* Scan Button */}
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          {scanning ? (
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          ) : (
            <Mail className="h-7 w-7 text-primary" />
          )}
        </div>
        <h3 className="mt-4 text-base font-semibold">
          {scanning
            ? "이메일을 분석하고 있습니다..."
            : results
              ? `${results.length}개의 구독 서비스를 발견했습니다`
              : "Gmail에서 구독 서비스를 찾아보세요"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {scanning
            ? "영수증, 청구서, 구독 관련 이메일을 검색 중입니다"
            : results
              ? "아래 목록에서 추가할 서비스를 선택하세요"
              : "결제 영수증, 구독 확인 이메일 등을 분석합니다"}
        </p>
        {!scanning && !results && (
          <button
            onClick={handleScan}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Search className="h-4 w-4" />
            스캔 시작
          </button>
        )}
        {!scanning && results && (
          <button
            onClick={handleScan}
            className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            다시 스캔
          </button>
        )}
      </div>

      {/* Scan Progress */}
      {scanning && (
        <div className="space-y-2">
          {["영수증 이메일 검색 중...", "결제 알림 검색 중...", "구독 갱신 이메일 검색 중..."].map(
            (step, i) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                style={{ animationDelay: `${i * 0.8}s` }}
              >
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            )
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">감지된 서비스</h2>
          {results.map((sub) => {
            const conf = confidenceLabel(sub.confidence);
            const isAdded = added.has(sub.service_name);

            return (
              <div
                key={sub.service_name}
                className="card-interactive flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    {sub.service_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {sub.service_name}
                      </p>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${categoryColors[sub.category]}`}
                      >
                        {sub.category.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{sub.source_email_subject}</span>
                      <span className={conf.color}>
                        · 신뢰도 {conf.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      ${sub.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sub.billing_cycle === "monthly" ? "월간" : "연간"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAdd(sub.service_name)}
                    disabled={isAdded}
                    className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${
                      isAdded
                        ? "bg-success/10 text-success"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        추가됨
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        추가
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Info */}
          <div className="mt-4 flex gap-3 rounded-xl border border-border bg-card p-4">
            <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground">감지 정확도 안내</p>
              <p className="mt-1">
                이메일 내용을 기반으로 분석하므로 금액이나 결제 주기가 정확하지 않을 수 있습니다.
                추가 후 구독 목록에서 직접 수정할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
