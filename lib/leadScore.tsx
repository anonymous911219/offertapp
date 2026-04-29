type Offer = {
  pris?: number;
  status?: string;
};

type Activity = {
  id?: string | number;
};

type Customer = {
  email?: string;
};

export function calculateLeadScore(
  customer: Customer,
  offers: Offer[] | null | undefined,
  activities: Activity[] | null | undefined
) {
  let score = 0;

  const safeOffers = offers ?? [];
  const safeActivities = activities ?? [];

  // 👤 has email = +10
  if (customer?.email) score += 10;

  // 📄 has offers = +20
  score += safeOffers.length * 10;

  // 💰 revenue boost
  const revenue = safeOffers.reduce((sum, o) => sum + (o.pris ?? 0), 0);

  if (revenue > 5000) score += 20;
  if (revenue > 20000) score += 30;

  // 📩 engagement
  const sentOffers = safeOffers.filter(
    (o) => o.status === "sent"
  ).length;

  score += sentOffers * 5;

  // 🧠 activity boost
  score += safeActivities.length * 3;

  // clamp 0–100
  return Math.min(100, score);
}