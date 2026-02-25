import type { DetectedSubscription } from "@/types";
import type { RawEmail } from "@/lib/gmail";

// Known service patterns — service name, email patterns, default category
const KNOWN_SERVICES: {
  name: string;
  patterns: RegExp[];
  category: DetectedSubscription["category"];
}[] = [
  {
    name: "OpenAI",
    patterns: [/openai/i, /chatgpt/i],
    category: "ai",
  },
  {
    name: "Anthropic (Claude)",
    patterns: [/anthropic/i, /claude/i],
    category: "ai",
  },
  {
    name: "GitHub Copilot",
    patterns: [/github.*copilot/i, /copilot.*github/i],
    category: "ai",
  },
  {
    name: "Midjourney",
    patterns: [/midjourney/i],
    category: "ai",
  },
  {
    name: "AWS",
    patterns: [/amazon\s*web\s*services/i, /aws/i, /amazonaws/i],
    category: "cloud",
  },
  {
    name: "Google Cloud",
    patterns: [/google\s*cloud/i, /gcloud/i],
    category: "cloud",
  },
  {
    name: "Vercel",
    patterns: [/vercel/i],
    category: "cloud",
  },
  {
    name: "Supabase",
    patterns: [/supabase/i],
    category: "cloud",
  },
  {
    name: "Heroku",
    patterns: [/heroku/i],
    category: "cloud",
  },
  {
    name: "Notion",
    patterns: [/notion/i, /notionhq/i],
    category: "saas",
  },
  {
    name: "Figma",
    patterns: [/figma/i],
    category: "saas",
  },
  {
    name: "Slack",
    patterns: [/slack/i],
    category: "saas",
  },
  {
    name: "Zoom",
    patterns: [/zoom/i],
    category: "saas",
  },
  {
    name: "Netflix",
    patterns: [/netflix/i],
    category: "entertainment",
  },
  {
    name: "YouTube Premium",
    patterns: [/youtube\s*premium/i],
    category: "entertainment",
  },
  {
    name: "Spotify",
    patterns: [/spotify/i],
    category: "entertainment",
  },
  {
    name: "GitHub",
    patterns: [/github/i],
    category: "saas",
  },
  {
    name: "Stripe",
    patterns: [/stripe/i],
    category: "api",
  },
  {
    name: "Twilio",
    patterns: [/twilio/i],
    category: "api",
  },
  {
    name: "SendGrid",
    patterns: [/sendgrid/i],
    category: "api",
  },
  {
    name: "MongoDB Atlas",
    patterns: [/mongodb/i, /atlas/i],
    category: "cloud",
  },
  {
    name: "Datadog",
    patterns: [/datadog/i],
    category: "saas",
  },
  {
    name: "Linear",
    patterns: [/linear\.app/i, /from:.*linear/i],
    category: "saas",
  },
];

// Amount extraction patterns
const AMOUNT_PATTERNS = [
  /\$\s*([\d,]+\.?\d{0,2})/,
  /USD\s*([\d,]+\.?\d{0,2})/,
  /([\d,]+\.?\d{0,2})\s*USD/,
  /₩\s*([\d,]+)/,
  /KRW\s*([\d,]+)/,
  /([\d,]+)\s*원/,
];

// Billing cycle detection
const CYCLE_PATTERNS: { pattern: RegExp; cycle: DetectedSubscription["billing_cycle"] }[] = [
  { pattern: /month|monthly|per\s*month|\/mo|월간|매월|월\s*구독/i, cycle: "monthly" },
  { pattern: /year|yearly|annual|per\s*year|\/yr|연간|매년|연\s*구독/i, cycle: "yearly" },
  { pattern: /week|weekly|per\s*week|주간|매주/i, cycle: "weekly" },
];

function extractAmount(text: string): { amount: number; currency: string } | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const raw = match[1].replace(/,/g, "");
      const amount = parseFloat(raw);
      if (amount > 0 && amount < 100000) {
        const currency = pattern.source.includes("₩") || pattern.source.includes("KRW") || pattern.source.includes("원")
          ? "KRW"
          : "USD";
        return { amount, currency };
      }
    }
  }
  return null;
}

function detectBillingCycle(text: string): DetectedSubscription["billing_cycle"] {
  for (const { pattern, cycle } of CYCLE_PATTERNS) {
    if (pattern.test(text)) return cycle;
  }
  return "monthly"; // Default assumption
}

function identifyService(
  email: RawEmail
): { name: string; category: DetectedSubscription["category"] } | null {
  const searchText = `${email.from} ${email.subject} ${email.snippet}`;

  for (const service of KNOWN_SERVICES) {
    for (const pattern of service.patterns) {
      if (pattern.test(searchText)) {
        return { name: service.name, category: service.category };
      }
    }
  }

  return null;
}

export function detectSubscriptions(emails: RawEmail[]): DetectedSubscription[] {
  const detected = new Map<string, DetectedSubscription>();

  for (const email of emails) {
    const service = identifyService(email);
    if (!service) continue;

    // Skip if already detected (keep most recent)
    if (detected.has(service.name)) continue;

    const fullText = `${email.subject} ${email.snippet} ${email.body}`;
    const amountInfo = extractAmount(fullText);
    const cycle = detectBillingCycle(fullText);

    detected.set(service.name, {
      service_name: service.name,
      amount: amountInfo?.amount || 0,
      currency: amountInfo?.currency || "USD",
      billing_cycle: cycle,
      category: service.category,
      source_email_subject: email.subject,
      source_email_date: email.date,
      confidence: amountInfo ? 0.9 : 0.6,
    });
  }

  return Array.from(detected.values()).sort((a, b) => b.confidence - a.confidence);
}
