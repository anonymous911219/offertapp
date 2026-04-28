import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
  } catch (error) {
    return Response.json({ error: error.message });
  }
}