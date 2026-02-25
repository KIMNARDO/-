"use client";

import type { LucideIcon } from "lucide-react";
import Tooltip from "@/components/layout/Tooltip";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  subtitleColor?: "default" | "success" | "warning" | "destructive";
  icon: LucideIcon;
  tooltip?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  subtitleColor = "default",
  icon: Icon,
  tooltip,
}: StatCardProps) {
  const subtitleColorMap = {
    default: "text-muted-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <div className="card-interactive rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            {tooltip && (
              <Tooltip content={tooltip} position="right" />
            )}
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className={`mt-1 text-xs ${subtitleColorMap[subtitleColor]}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );
}
