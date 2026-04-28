"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function CustomerPage() {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      // CUSTOMER
      const { data: customerData } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

      setCustomer(customerData);

      // OFFERS
      const { data: offersData } = await supabase
        .from("offers")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false });

      setOffers(offersData || []);
    };

    load();
  }, [id]);

  if (!customer) return <div style={{ color: "white", padding: 20 }}>Laddar...</div>;

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>👤 Kund</h1>

      <div style={{ background: "#121a2b", padding: 20, borderRadius: 10 }}>
        <h2>{customer.name}</h2>
        <p>{customer.email}</p>
      </div>

      <h3 style={{ marginTop: 20 }}>📄 Offerter</h3>

      {offers.map((o) => (
        <div
          key={o.id}
          style={{
            background: "#121a2b",
            padding: 12,
            marginTop: 10,
            borderRadius: 10,
          }}
        >
          <b>{o.offert_id}</b>
          <p>💰 {o.pris} kr</p>
        </div>
      ))}
    </div>
  );
}