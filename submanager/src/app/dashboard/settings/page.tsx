"use client";

import { useState } from "react";
import {
  Mail,
  Bell,
  Shield,
  Smartphone,
  Check,
  ExternalLink,
} from "lucide-react";
import Tooltip from "@/components/layout/Tooltip";

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [daysBefore, setDaysBefore] = useState([3, 1]);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleDay = (day: number) => {
    setDaysBefore((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => b - a)
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">설정</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          알림 및 연결 설정을 관리합니다
        </p>
      </div>

      {/* Connection Status */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">연결 상태</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10">
                <Mail className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium">Gmail</p>
                <p className="text-xs text-muted-foreground">
                  user@gmail.com · 읽기 전용
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-pulse h-2 w-2 rounded-full bg-success" />
              <span className="text-xs text-success">연결됨</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10">
                <Shield className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium">Supabase</p>
                <p className="text-xs text-muted-foreground">
                  데이터베이스 연결
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-pulse h-2 w-2 rounded-full bg-success" />
              <span className="text-xs text-success">연결됨</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">알림 설정</h2>
          <Tooltip content="결제일 전에 알림을 받아 불필요한 구독을 미리 정리할 수 있습니다" />
        </div>

        <div className="space-y-2">
          {/* Email */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">이메일 알림</p>
                <p className="text-xs text-muted-foreground">
                  결제일 전 이메일로 알림
                </p>
              </div>
            </div>
            <button
              onClick={() => setEmailNotif(!emailNotif)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                emailNotif ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  emailNotif ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Browser Push */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">브라우저 푸시 알림</p>
                <p className="text-xs text-muted-foreground">
                  브라우저에서 직접 알림
                </p>
              </div>
            </div>
            <button
              onClick={() => setPushNotif(!pushNotif)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                pushNotif ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  pushNotif ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Notification Timing */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">알림 시점</h2>
          <Tooltip content="결제일로부터 며칠 전에 알림을 받을지 설정합니다. 여러 개를 선택할 수 있습니다." />
        </div>
        <div className="flex flex-wrap gap-2">
          {[7, 5, 3, 2, 1].map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors ${
                daysBefore.includes(day)
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {daysBefore.includes(day) && <Check className="h-3.5 w-3.5" />}
              {day}일 전
            </button>
          ))}
        </div>
      </section>

      {/* PWA Install Guide */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">앱 설치</h2>
          <Tooltip content="웹 브라우저에서 앱처럼 설치하여 사용할 수 있습니다 (PWA)" />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                SubManager를 앱으로 설치하세요
              </p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>
                  <strong className="text-foreground">Chrome/Edge:</strong>{" "}
                  주소창 오른쪽의 설치 아이콘을 클릭하세요
                </p>
                <p>
                  <strong className="text-foreground">Safari (iOS):</strong>{" "}
                  공유 버튼 → &quot;홈 화면에 추가&quot;를 탭하세요
                </p>
                <p>
                  <strong className="text-foreground">Android:</strong>{" "}
                  메뉴(⋮) → &quot;앱 설치&quot; 또는 &quot;홈 화면에 추가&quot;를 탭하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <a
          href="/setup"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          초기 설정 다시 보기
        </a>
        <button
          onClick={handleSave}
          className={`flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors ${
            saved
              ? "bg-success text-white"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              저장됨
            </>
          ) : (
            "설정 저장"
          )}
        </button>
      </div>
    </div>
  );
}
