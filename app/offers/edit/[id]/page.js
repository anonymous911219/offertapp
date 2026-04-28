"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditOffer({ params }) {
  const router = useRouter();

  const [offer, setOffer] = useState(null);

  useEffect(() => {
    loadOffer();
  }, []);

  const loadOffer = async () => {
    const { data } = await supabase
      .from("offers")
      .select("*")
      .eq("id", params.id)
      .single();

    setOffer(data);
  };

  const updateOffer = async () => {
    await supabase
      .from("offers")
      .update({
        namn: offer.namn,
        email: offer.email,
        pris: offer.pris,
        status: offer.status
      })
      .eq("id", params.id);

    router.push("/offers");
  };

  if (!offer) return <p>Laddar...</p>;

  return (
    <div style={styles.page}>
      <h1>Edit Offert</h1>

      <div style={styles.card}>
        <input
          value={offer.namn}
          onChange={(e) => setOffer({ ...offer, namn: e.target.value })}
        />

        <input
          value={offer.email}
          onChange={(e) => setOffer({ ...offer, email: e.target.value })}
        />

        <input
          value={offer.pris}
          onChange={(e) => setOffer({ ...offer, pris: Number(e.target.value) })}
        />

        <select
          value={offer.status}
          onChange={(e) => setOffer({ ...offer, status: e.target.value })}
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="paid">Paid</option>
        </select>

        <button onClick={updateOffer}>Spara</button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 40,
    fontFamily: "Arial",
    background: "#0b1220",
    minHeight: "100vh",
    color: "white"
  },
  card: {
    background: "#121a2b",
    padding: 20,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10
  }
};