export function calculateLeadScore(customer, offers, activities) {
  let score = 0;

  // 👤 has email = +10
  if (customer.email) score += 10;

  // 📄 has offers = +20
  score += offers.length * 10;

  // 💰 revenue boost
  const revenue = offers.reduce((sum, o) => sum + (o.pris || 0), 0);

  if (revenue > 5000) score += 20;
  if (revenue > 20000) score += 30;

  // 📩 engagement
  const sentOffers = offers.filter(o => o.status === "sent").length;
  score += sentOffers * 5;

  // 🧠 activity boost
  score += activities.length * 3;

  // clamp 0–100
  return Math.min(100, score);
}