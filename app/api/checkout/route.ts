import Stripe from "stripe";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

/* =========================
   STRIPE INIT
========================= */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
});

/* =========================
   POST ROUTE
========================= */

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { amount } = await req.json();

    if (!amount || typeof amount !== "number") {
      return Response.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "sek",
            product_data: {
              name: "Fönsterputs Offert",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],

      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("STRIPE ERROR:", message);

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}