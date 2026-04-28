"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [sendingId, setSendingId] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const [newOffer, setNewOffer] = useState({
    namn: "",
    email: "",
    antal_fonster: 0,
    hojd: 0,
    bredd: 0,
    sprojs: false,
  });

  const generateOfferId = () => {
    const now = new Date();
    return `OFF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const fetchOffers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error.message);

    setOffers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  /* PRICE */
  const calcPrice = (f) => {
    const antal = Number(f.antal_fonster) || 0;
    const hojd = Number(f.hojd) || 0;
    const bredd = Number(f.bredd) || 0;

    const base =
      antal * 50 +
      (hojd * bredd) / 1000 +
      (f.sprojs ? antal * 10 : 0);

    return Math.round(base);
  };

  /* SEND OFFER */
  const sendOffer = async (offer) => {
    setSendingId(offer.id);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offer),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Kunde inte skicka mail");
        setSendingId(null);
        return;
      }

      // 🔥 uppdatera status
      await supabase
        .from("offers")
        .update({ status: "sent" })
        .eq("id", offer.id);

      // 🔥 uppdatera UI direkt
      setOffers((prev) =>
        prev.map((o) =>
          o.id === offer.id ? { ...o, status: "sent" } : o
        )
      );

    } catch (err) {
      console.error(err);
      alert("Fel vid skickning");
    }

    setSendingId(null);
  };

  /* CREATE */
  const createOffer = async () => {
    setCreating(true);

    const offer = {
      ...newOffer,
      offert_id: generateOfferId(),
      pris: calcPrice(newOffer),
      status: "draft",
    };

    const { error } = await supabase.from("offers").insert([offer]);

    if (error) {
      console.error(error.message);
      setCreating(false);
      return;
    }

    setNewOffer({
      namn: "",
      email: "",
      antal_fonster: 0,
      hojd: 0,
      bredd: 0,
      sprojs: false,
    });

    await fetchOffers();
    setCreating(false);
  };

  const deleteOffer = async (id) => {
    if (!confirm("Ta bort offert?")) return;
    await supabase.from("offers").delete().eq("id", id);
    fetchOffers();
  };

  const startEdit = (offer) => {
    setEditId(offer.id);
    setEditData({ ...offer });
  };

  const saveEdit = async () => {
    await supabase
      .from("offers")
      .update({
        ...editData,
        pris: calcPrice(editData),
      })
      .eq("id", editId);

    setEditId(null);
    fetchOffers();
  };

  const filtered = offers.filter((o) =>
    `${o.offert_id} ${o.namn} ${o.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>📋 Offerter</h1>

        <input
          style={styles.search}
          placeholder="Sök..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CREATE */}
        <div style={styles.card}>
          <h3>➕ Skapa ny offert</h3>

          <div style={styles.grid}>
            <Input label="Namn" value={newOffer.namn}
              onChange={(v) => setNewOffer({ ...newOffer, namn: v })}
            />
            <Input label="Email" value={newOffer.email}
              onChange={(v) => setNewOffer({ ...newOffer, email: v })}
            />
            <Input label="Antal fönster" type="number"
              value={newOffer.antal_fonster}
              onChange={(v) => setNewOffer({ ...newOffer, antal_fonster: Number(v) })}
            />
            <Input label="Höjd" type="number"
              value={newOffer.hojd}
              onChange={(v) => setNewOffer({ ...newOffer, hojd: Number(v) })}
            />
            <Input label="Bredd" type="number"
              value={newOffer.bredd}
              onChange={(v) => setNewOffer({ ...newOffer, bredd: Number(v) })}
            />
          </div>

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={newOffer.sprojs}
              onChange={(e) =>
                setNewOffer({ ...newOffer, sprojs: e.target.checked })
              }
            />
            Spröjs
          </label>

          <button style={styles.primaryBtn} onClick={createOffer}>
            {creating ? "Skapar..." : "Skapa offert"}
          </button>
        </div>

        {/* LIST */}
        {loading ? (
          <p>Laddar...</p>
        ) : (
          filtered.map((o) => (
            <div key={o.id} style={styles.card}>
              <div style={styles.topRow}>
                <span style={styles.badge}>{o.offert_id}</span>
                <span style={styles.status(o.status)}>
                  {o.status === "sent" ? "Skickad" : "Utkast"}
                </span>
              </div>

              <p><b>{o.namn}</b></p>
              <p style={{ opacity: 0.7 }}>{o.email}</p>

              <div style={styles.row}>
                <button style={styles.secondaryBtn} onClick={() => startEdit(o)}>
                  Redigera
                </button>

                <button
                  style={{
                    ...styles.primaryBtn,
                    background: o.status === "sent" ? "#16a34a" : "#4f7cff",
                  }}
                  onClick={() => sendOffer(o)}
                  disabled={sendingId === o.id}
                >
                  {sendingId === o.id
                    ? "Skickar..."
                    : o.status === "sent"
                    ? "Skicka igen"
                    : "Skicka"}
                </button>

                <button style={styles.dangerBtn} onClick={() => deleteOffer(o.id)}>
                  Ta bort
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* INPUT */
function Input({ label, value, onChange, type = "text" }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        style={styles.input}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* STYLES */
const styles = {
  page: { background: "#0b1220", minHeight: "100vh", color: "white", padding: 24 },
  container: { maxWidth: 1100, margin: "0 auto" },
  title: { fontSize: 28 },

  search: { width: "100%", padding: 14, borderRadius: 12, marginBottom: 16, background: "#0f172a", color: "white" },

  card: { background: "#121a2b", padding: 16, borderRadius: 14, marginBottom: 12 },

  topRow: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  badge: { fontSize: 12, background: "#1f2a44", padding: "4px 10px", borderRadius: 999 },
  status: (s) => ({ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: s === "sent" ? "#14532d" : "#1f2a44" }),

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 },

  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "#94a3b8" },
  input: { padding: 12, borderRadius: 10, background: "#0b1220", color: "white", border: "1px solid #24314a" },

  checkbox: { display: "flex", gap: 10, marginTop: 10 },
  row: { display: "flex", gap: 10, marginTop: 10 },

  primaryBtn: { flex: 1, padding: 10, background: "#4f7cff", color: "white", borderRadius: 10, border: "none" },
  secondaryBtn: { flex: 1, padding: 10, background: "#1f2a44", color: "white", borderRadius: 10 },
  dangerBtn: { flex: 1, padding: 10, background: "#2a0f14", color: "#ff5c5c", borderRadius: 10 },
};