"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

/* =========================
   TYPE
========================= */
type Offer = {
  id: string | number;
  offert_id?: string;
  status?: string;
  namn?: string;
  email?: string;

  antal_fonster?: number;
  hojd?: number;
  bredd?: number;
  sprojs?: boolean;
};

export default function OffertPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOffer = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        setOffer(null);
        setLoading(false);
        return;
      }

      setOffer((data as Offer) ?? null);
      setLoading(false);
    };

    fetchOffer();
  }, [id]);

  /* =========================
     LOADING / ERROR
  ========================= */
  if (loading) {
    return <p style={styles.page}>Laddar offert...</p>;
  }

  if (!offer) {
    return <p style={styles.page}>Offert hittades inte</p>;
  }

  /* =========================
     SAFE CALCULATION
  ========================= */
  const total =
    (offer.antal_fonster ?? 0) * 50 +
    ((offer.hojd ?? 0) * (offer.bredd ?? 0)) / 1000 +
    (offer.sprojs ? (offer.antal_fonster ?? 0) * 10 : 0);

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h1>OFFERT</h1>
        <p>Offert ID: {offer.offert_id}</p>
        <p>Status: {offer.status}</p>
      </div>

      <div style={styles.section}>
        <h2>Kund</h2>
        <p><b>Namn:</b> {offer.namn}</p>
        <p><b>Email:</b> {offer.email}</p>
      </div>

      <div style={styles.section}>
        <h2>Specifikationer</h2>
        <p>Antal fönster: {offer.antal_fonster}</p>
        <p>Höjd: {offer.hojd} cm</p>
        <p>Bredd: {offer.bredd} cm</p>
        <p>Spröjs: {offer.sprojs ? "Ja" : "Nej"}</p>
      </div>

      <div style={styles.priceBox}>
        <h2>Totalpris</h2>
        <h1>{total} kr</h1>
      </div>

      <div style={styles.actions}>
        <button onClick={() => window.print()} style={styles.btnPrimary}>
          Skriv ut / Spara PDF
        </button>
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  wrapper: {
    maxWidth: 800,
    margin: "40px auto",
    padding: 40,
    background: "white",
    color: "black",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Arial",
    borderRadius: 10,
  },

  header: {
    borderBottom: "2px solid #eee",
    marginBottom: 20,
    paddingBottom: 10,
  },

  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "1px solid #eee",
  },

  priceBox: {
    marginTop: 30,
    padding: 20,
    background: "#f5f5f5",
    borderRadius: 10,
    textAlign: "center",
  },

  actions: {
    marginTop: 30,
    textAlign: "center",
  },

  btnPrimary: {
    padding: "12px 20px",
    background: "#4f7cff",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 16,
  },

  page: {
    padding: 30,
  },
} as const;