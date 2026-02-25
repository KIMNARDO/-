export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  google_access_token?: string;
  google_refresh_token?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  amount: number;
  currency: string;
  billing_cycle: "monthly" | "yearly" | "weekly";
  next_payment_date: string;
  status: "active" | "cancelled" | "paused";
  category: "ai" | "api" | "saas" | "entertainment" | "cloud" | "other";
  detected_from_email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSetting {
  id: string;
  user_id: string;
  email_enabled: boolean;
  days_before: number[];
  created_at: string;
}

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed" | "current" | "error";
  guide: string[];
}

export interface DetectedSubscription {
  service_name: string;
  amount: number;
  currency: string;
  billing_cycle: "monthly" | "yearly" | "weekly";
  next_payment_date?: string;
  category: Subscription["category"];
  source_email_subject: string;
  source_email_date: string;
  confidence: number;
}
