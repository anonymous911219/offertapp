import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // 💳 BETALNING LYCKAD
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const customerEmail = session.customer_details.email;

    // 🟢 MARKERA USER SOM BETALD
    await supabase
      .from("profiles")
      .update({ paid: true })
      .eq("email", customerEmail);
  }

  return NextResponse.json({ received: true });
}