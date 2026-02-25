"use client";

import {
  Layers,
  ArrowRight,
  Shield,
  Zap,
  Bell,
  CreditCard,
  TrendingDown,
  Eye,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Eye,
    title: "자동 구독 감지",
    desc: "Gmail 이메일을 분석해 결제 중인 서비스를 자동으로 찾아냅니다",
  },
  {
    icon: Bell,
    title: "결제일 사전 알림",
    desc: "결제 3일 전, 1일 전 알림으로 불필요한 지출을 방지합니다",
  },
  {
    icon: TrendingDown,
    title: "비용 분석",
    desc: "월별 구독 비용을 카테고리별로 분석하고 절약 포인트를 제안합니다",
  },
  {
    icon: CreditCard,
    title: "구독 컨트롤",
    desc: "유지 / 해지 / 홀딩 결정을 한곳에서 관리합니다",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Layers className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              SubManager
            </span>
          </div>
          <Link
            href="/setup"
            className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            시작하기
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            Gmail 읽기 전용 — 이메일 수정 없음
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            구독 비용,
            <br />
            <span className="text-primary">더 이상 잊지 마세요</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            OpenAI, Claude, AWS, Netflix... 매달 빠져나가는 구독료.
            <br />
            이메일을 분석해 자동으로 감지하고, 결제일 전에 알려드립니다.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/setup"
              className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Zap className="h-4 w-4" />
              무료로 시작하기
            </Link>
            <Link
              href="#features"
              className="flex h-11 items-center rounded-xl border border-border px-6 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              더 알아보기
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/5">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
            <span className="ml-3 text-xs text-muted-foreground">
              SubManager — 대시보드
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 p-6">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">월 총 구독비</p>
              <p className="mt-1 text-2xl font-bold tracking-tight">
                ₩287,400
              </p>
              <p className="mt-1 text-xs text-success">지난달 대비 -12.3%</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">활성 구독</p>
              <p className="mt-1 text-2xl font-bold tracking-tight">14개</p>
              <p className="mt-1 text-xs text-muted-foreground">
                AI 5 · API 3 · SaaS 6
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">이번 주 결제 예정</p>
              <p className="mt-1 text-2xl font-bold tracking-tight">3건</p>
              <p className="mt-1 text-xs text-warning">₩89,000 예정</p>
            </div>
            <div className="col-span-3 space-y-2">
              {[
                { name: "OpenAI API", amount: "$20.00", date: "3일 후", cat: "AI" },
                { name: "Claude Pro", amount: "$20.00", date: "5일 후", cat: "AI" },
                { name: "AWS", amount: "$45.30", date: "12일 후", cat: "Cloud" },
                { name: "Figma", amount: "$15.00", date: "18일 후", cat: "SaaS" },
              ].map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.cat}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{s.amount}</p>
                    <p className="text-xs text-warning">{s.date} 결제</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center text-2xl font-bold tracking-tight">
          왜 SubManager인가요?
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          구독 결제의 모든 것을 한곳에서
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-interactive rounded-xl border border-border bg-card p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        SubManager — 이메일 읽기 전용 권한만 사용합니다. 데이터는 암호화되어
        안전하게 보관됩니다.
      </footer>
    </div>
  );
}
