export const sendOfferEmail = async (offer) => {
  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(offer),
  });

  return await res.json();
};