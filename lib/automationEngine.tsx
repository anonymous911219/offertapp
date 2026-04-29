import { supabase } from "@/lib/supabase";

/**
 * Runs automation rules for a customer
 */
export async function runAutomation(customerId: string) {
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  const { data: offersRaw } = await supabase
    .from("offers")
    .select("*")
    .eq("customer_id", customerId);

  const { data: activitiesRaw } = await supabase
    .from("activities")
    .select("*")
    .eq("customer_id", customerId);

  const offers = offersRaw ?? [];
  const activities = activitiesRaw ?? [];

  /* =========================
     REVENUE CALC (SAFE)
  ========================= */
  const revenue = offers.reduce(
    (s, o) => s + (o?.pris ?? 0),
    0
  );

  /* 🔥 RULE 1: HOT LEAD */
  if (revenue > 20000) {
    await createActivity(
      customerId,
      null,
      "hot_lead",
      "🔥 High value customer detected"
    );
  }

  /* =========================
     RULE 2: FOLLOW-UP
     (sort ensures correct last offer)
  ========================= */
  const lastOffer = offers
    .filter((o) => o?.created_at)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )[0];

  if (lastOffer?.status === "sent" && lastOffer?.created_at) {
    const diffDays =
      (Date.now() - new Date(lastOffer.created_at).getTime()) /
      (1000 * 60 * 60 * 24);

    if (diffDays > 3) {
      await createActivity(
        customerId,
        lastOffer.id,
        "follow_up",
        "⏳ No response in 3 days – follow-up recommended"
      );
    }
  }

  /* 💤 RULE 3: DEAD LEAD */
  if (activities.length === 0 && offers.length === 0) {
    await createActivity(
      customerId,
      null,
      "cold_lead",
      "❄️ No activity yet"
    );
  }
}

/* =========================
   HELPER
========================= */
async function createActivity(
  customer_id: string,
  offer_id: string | null,
  type: string,
  message: string
) {
  await supabase.from("activities").insert([
    {
      customer_id,
      offer_id,
      type,
      message,
    },
  ]);
}