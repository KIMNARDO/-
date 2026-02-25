"use client";

import { useState, useRef } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({
  content,
  children,
  showIcon = true,
  position = "top",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {showIcon && (
        <HelpCircle className="ml-1 h-3.5 w-3.5 cursor-help text-muted-foreground hover:text-primary transition-colors" />
      )}
      {visible && (
        <span
          className={`tooltip-enter absolute z-50 w-max max-w-xs rounded-lg border border-border bg-card px-3 py-2 text-xs text-card-foreground shadow-lg ${positionClasses[position]}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
