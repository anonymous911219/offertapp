import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// =========================
// WEBHOOK ROUTE
// =========================
export async function POST(req: Request) {
  try {
    // =========================
    // ENV (runtime-safe)
    // =========================
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseKey) {
      console.error("Missing env vars for Stripe webhook");

      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    // =========================
    // CLIENTS
    // =========================
    const stripe = new Stripe(stripeSecret);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // =========================
    // REQUEST DATA
    // =========================
    const body = await req.text();

    // 🔥 FIX: headers() is async in your Next.js version
    const sig = (await headers()).get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    // =========================
    // VERIFY STRIPE EVENT
    // =========================
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        webhookSecret
      );
    } catch (err) {
      console.error("Stripe signature error:", err);

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // =========================
    // HANDLE EVENT
    // =========================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = session.customer_details?.email;

      if (!email) {
        return NextResponse.json(
          { error: "Missing email" },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("profiles")
        .update({ paid: true })
        .eq("email", email);

      if (error) {
        console.error("Supabase update error:", error.message);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook crash:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}