"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/* =========================
   TYPES
========================= */

type Customer = {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at?: string;
};

type NewCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

/* =========================
   COMPONENT
========================= */

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  /* =========================
     FETCH
  ========================= */
  const fetchCustomers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("FETCH ERROR:", error.message);
      setLoading(false);
      return;
    }

    setCustomers((data ?? []) as Customer[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* =========================
     CREATE
  ========================= */
  const createCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert("Namn och email krävs");
      return;
    }

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          address: newCustomer.address,
          notes: newCustomer.notes,
        },
      ])
      .select("*");

    if (error) {
      console.error("CREATE ERROR:", error.message);
      alert(error.message);
      return;
    }

    const inserted = (data ?? []) as Customer[];

    setCustomers((prev) => [...inserted, ...prev]);

    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return <div style={styles.page}>Laddar kunder...</div>;
  }

  /* =========================
     UI
  ========================= */
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>👥 Kunder</h1>

        {/* CREATE FORM */}
        <div style={styles.card}>
          <h3>➕ Skapa kund</h3>

          <input
            placeholder="Namn"
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, name: e.target.value })
            }
            style={styles.input}
          />

          <input
            placeholder="Email"
            value={newCustomer.email}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, email: e.target.value })
            }
            style={styles.input}
          />

          <input
            placeholder="Telefon"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
            style={styles.input}
          />

          <input
            placeholder="Adress"
            value={newCustomer.address}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, address: e.target.value })
            }
            style={styles.input}
          />

          <textarea
            placeholder="Anteckningar"
            value={newCustomer.notes}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, notes: e.target.value })
            }
            style={styles.textarea}
          />

          <button onClick={createCustomer} style={styles.button}>
            Skapa kund
          </button>
        </div>

        {/* LIST */}
        <h3>📋 Alla kunder</h3>

        {customers.length === 0 && (
          <p style={{ opacity: 0.6 }}>Inga kunder ännu</p>
        )}

        {customers.map((c) => (
          <div
            key={c.id}
            style={styles.customerCard}
            onClick={() => router.push(`/customer/${c.id}`)}
          >
            <b>{c.name}</b>
            <p style={{ opacity: 0.7 }}>{c.email}</p>
            <p style={{ fontSize: 12, opacity: 0.5 }}>{c.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */

const styles: Record<string, CSSProperties> = {
  page: {
    background: "#0b1220",
    minHeight: "100vh",
    color: "white",
    padding: 20,
  },

  container: {
    maxWidth: 900,
    margin: "0 auto",
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
  },

  card: {
    background: "#121a2b",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #1f2a44",
    background: "#0b1220",
    color: "white",
  },

  textarea: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #1f2a44",
    background: "#0b1220",
    color: "white",
    minHeight: 80,
  },

  button: {
    padding: 10,
    background: "#4f7cff",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
  },

  customerCard: {
    background: "#121a2b",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    cursor: "pointer",
  },
};