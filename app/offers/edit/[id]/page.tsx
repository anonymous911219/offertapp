"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* =========================
   TYPE
========================= */
type Offer = {
  id: string | number;
  namn: string;
  email: string;
  pris: number;
  status: string;
};

/* =========================
   COMPONENT
========================= */

export default function EditOffer() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id as string | undefined;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /* =========================
     LOAD
  ========================= */
  useEffect(() => {
    const loadOffer = async () => {
      if (!id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Load error:", error.message);
        setOffer(null);
        setLoading(false);
        return;
      }

      setOffer((data ?? null) as Offer | null);
      setLoading(false);
    };

    loadOffer();
  }, [id]);

  /* =========================
     UPDATE
  ========================= */
  const updateOffer = async () => {
    if (!offer || !id) return;

    const { error } = await supabase
      .from("offers")
      .update({
        namn: offer.namn,
        email: offer.email,
        pris: offer.pris,
        status: offer.status,
      })
      .eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    router.push("/offers");
  };

  /* =========================
     LOADING / EMPTY
  ========================= */
  if (loading) return <p style={styles.page}>Laddar...</p>;
  if (!offer) return <p style={styles.page}>Hittade ingen offert</p>;

  /* =========================
     UI
  ========================= */
  return (
    <div style={styles.page}>
      <h1>Edit Offert</h1>

      <div style={styles.card}>
        <input
          value={offer.namn}
          onChange={(e) =>
            setOffer({ ...offer, namn: e.target.value })
          }
        />

        <input
          value={offer.email}
          onChange={(e) =>
            setOffer({ ...offer, email: e.target.value })
          }
        />

        <input
          type="number"
          value={offer.pris}
          onChange={(e) =>
            setOffer({ ...offer, pris: Number(e.target.value) })
          }
        />

        <select
          value={offer.status}
          onChange={(e) =>
            setOffer({ ...offer, status: e.target.value })
          }
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="paid">Paid</option>
        </select>

        <button onClick={updateOffer} style={styles.button}>
          Spara
        </button>
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */

const styles = {
  page: {
    padding: 40,
    fontFamily: "Arial",
    background: "#0b1220",
    minHeight: "100vh",
    color: "white",
  },

  card: {
    background: "#121a2b",
    padding: 20,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 500,
  },

  button: {
    padding: 10,
    background: "#4f7cff",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
  },
} as const;