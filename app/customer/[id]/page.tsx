"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

/* =========================
   TYPES
========================= */

type Customer = {
  id: string | number;
  name: string;
  email: string;
};

type Offer = {
  id: string | number;
  offert_id?: string;
  pris?: number;
  created_at?: string;
};

/* =========================
   PAGE
========================= */

export default function CustomerPage() {
  const { id } = useParams();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      // CUSTOMER
      const { data: customerData } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

      setCustomer(customerData as Customer);

      // OFFERS
      const { data: offersData } = await supabase
        .from("offers")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false });

      setOffers((offersData as Offer[]) || []);
    };

    load();
  }, [id]);

  if (!customer) {
    return (
      <div style={styles.loading}>
        Laddar...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>👤 Kund</h1>

      <div style={styles.card}>
        <h2>{customer.name}</h2>
        <p>{customer.email}</p>
      </div>

      <h3 style={{ marginTop: 20 }}>📄 Offerter</h3>

      {offers.map((o) => (
        <div key={o.id} style={styles.card}>
          <b>{o.offert_id}</b>
          <p>💰 {o.pris} kr</p>
        </div>
      ))}
    </div>
  );
}

/* =========================
   STYLES
========================= */

const styles: Record<string, CSSProperties> = {
  page: {
    padding: 20,
    color: "white",
  },

  loading: {
    color: "white",
    padding: 20,
  },

  card: {
    background: "#121a2b",
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
  },
};