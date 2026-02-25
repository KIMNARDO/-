"use client";

import { CalendarDays, AlertTriangle } from "lucide-react";
import type { Subscription } from "@/types";
import { format, differenceInDays, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

interface UpcomingPaymentsProps {
  subscriptions: Subscription[];
}

export default function UpcomingPayments({
  subscriptions,
}: UpcomingPaymentsProps) {
  const today = new Date();

  const upcoming = subscriptions
    .filter((s) => s.status === "active" && s.next_payment_date)
    .map((s) => ({
      ...s,
      daysLeft: differenceInDays(parseISO(s.next_payment_date), today),
    }))
    .filter((s) => s.daysLeft >= 0 && s.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">다가오는 결제</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            30일 내 결제 예정
          </p>
        </div>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mt-4 space-y-1">
        {upcoming.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            30일 내 예정된 결제가 없습니다
          </p>
        ) : (
          upcoming.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                {s.daysLeft <= 3 && (
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium">{s.service_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(s.next_payment_date), "M월 d일 (EEE)", {
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {s.currency === "KRW" ? "₩" : "$"}
                  {s.amount.toLocaleString()}
                </p>
                <p
                  className={`text-xs ${
                    s.daysLeft <= 3
                      ? "text-destructive font-medium"
                      : s.daysLeft <= 7
                        ? "text-warning"
                        : "text-muted-foreground"
                  }`}
                >
                  {s.daysLeft === 0 ? "오늘" : `${s.daysLeft}일 후`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
