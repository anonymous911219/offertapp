import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(req) {
  try {
    const { amount } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "sek",
            product_data: {
              name: "Fönsterputs Offert"
            },
            unit_amount: amount * 100
          },
          quantity: 1
        }
      ],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel"
    });

    return Response.json({ url: session.url });
  } catch (error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown error";

  return Response.json({ error: message }, { status: 500 });
}
}