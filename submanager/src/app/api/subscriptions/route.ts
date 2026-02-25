import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("next_payment_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscriptions });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const body = await request.json();

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      service_name: body.service_name,
      amount: body.amount,
      currency: body.currency || "USD",
      billing_cycle: body.billing_cycle || "monthly",
      next_payment_date: body.next_payment_date,
      status: body.status || "active",
      category: body.category || "other",
      detected_from_email: body.detected_from_email,
      notes: body.notes,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscription: data });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json(
      { error: "Subscription ID required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      ...(body.status && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.amount && { amount: body.amount }),
      ...(body.next_payment_date && {
        next_payment_date: body.next_payment_date,
      }),
    })
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscription: data });
}
