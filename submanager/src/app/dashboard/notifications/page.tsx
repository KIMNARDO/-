"use client";

import { Bell, Check, Clock, Mail, AlertTriangle } from "lucide-react";
import Tooltip from "@/components/layout/Tooltip";

interface NotificationItem {
  id: string;
  service: string;
  amount: string;
  date: string;
  daysLeft: number;
  type: "upcoming" | "due_today" | "overdue";
  read: boolean;
}

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  { id: "1", service: "OpenAI API", amount: "$20.00", date: "2월 28일", daysLeft: 3, type: "upcoming", read: false },
  { id: "2", service: "Claude Pro", amount: "$20.00", date: "3월 2일", daysLeft: 5, type: "upcoming", read: false },
  { id: "3", service: "GitHub Copilot", amount: "$10.00", date: "3월 5일", daysLeft: 8, type: "upcoming", read: true },
  { id: "4", service: "AWS", amount: "$45.30", date: "3월 9일", daysLeft: 12, type: "upcoming", read: true },
  { id: "5", service: "Figma", amount: "$15.00", date: "3월 15일", daysLeft: 18, type: "upcoming", read: true },
];

const typeConfig = {
  due_today: {
    icon: AlertTriangle,
    label: "오늘 결제",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  upcoming: {
    icon: Clock,
    label: "결제 예정",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  overdue: {
    icon: AlertTriangle,
    label: "결제 완료",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export default function NotificationsPage() {
  const unread = DEMO_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">알림</h1>
            <Tooltip content="결제일 3일 전, 1일 전에 이메일로 알림을 보내드립니다. 설정에서 알림 주기를 변경할 수 있습니다." />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {unread > 0
              ? `읽지 않은 알림 ${unread}개`
              : "모든 알림을 확인했습니다"}
          </p>
        </div>
        {unread > 0 && (
          <button className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Check className="h-3.5 w-3.5" />
            모두 읽음
          </button>
        )}
      </div>

      {/* Notification Method Info */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
        <Mail className="h-4 w-4 text-primary" />
        <div className="flex-1">
          <p className="text-xs font-medium">이메일 알림 활성화됨</p>
          <p className="text-xs text-muted-foreground">
            결제일 3일 전, 1일 전에 알림이 발송됩니다
          </p>
        </div>
        <a
          href="/dashboard/settings"
          className="text-xs text-primary hover:underline"
        >
          설정 변경
        </a>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {DEMO_NOTIFICATIONS.map((n) => {
          const config = typeConfig[n.type];
          const Icon = config.icon;

          return (
            <div
              key={n.id}
              className={`flex items-center gap-4 rounded-xl border bg-card px-5 py-4 transition-colors ${
                n.read
                  ? "border-border"
                  : "border-primary/20 bg-primary/[0.02]"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${config.bg}`}
              >
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.service}</p>
                  {!n.read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {n.date} 결제 예정 · {n.amount}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-xs font-medium ${
                    n.daysLeft <= 3 ? "text-destructive" : n.daysLeft <= 7 ? "text-warning" : "text-muted-foreground"
                  }`}
                >
                  {n.daysLeft === 0 ? "오늘" : `${n.daysLeft}일 후`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {DEMO_NOTIFICATIONS.length === 0 && (
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">알림이 없습니다</p>
          <p className="mt-1 text-xs text-muted-foreground">
            구독을 추가하면 결제일 전에 알림을 받을 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
}
