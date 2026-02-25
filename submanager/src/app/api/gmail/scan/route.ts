import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { scanEmails } from "@/lib/gmail";
import { detectSubscriptions } from "@/lib/subscription-detector";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = (session as { accessToken?: string }).accessToken;
  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token. Please re-login with Gmail permissions." },
      { status: 403 }
    );
  }

  try {
    const emails = await scanEmails(accessToken);
    const subscriptions = detectSubscriptions(emails);

    return NextResponse.json({
      scanned: emails.length,
      detected: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error("Gmail scan error:", error);
    return NextResponse.json(
      { error: "Failed to scan emails" },
      { status: 500 }
    );
  }
}
