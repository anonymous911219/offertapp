"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* =========================
   TYPES
========================= */

type OfferStatus = "utkast" | "skickad";

type Offer = {
  id: string | number;
  offert_id: string;
  namn: string;
  email: string;
  antal_fonster: number;
  hojd: number;
  bredd: number;
  sprojs: boolean;
  pris: number;
  status: OfferStatus;
};

type NewOffer = {
  namn: string;
  email: string;
  antal_fonster: number;
  hojd: number;
  bredd: number;
  sprojs: boolean;
};

/* =========================
   HELPERS
========================= */

const normalizeStatus = (status: any): OfferStatus =>
  status === "skickad" || status === "sent" ? "skickad" : "utkast";

const generateOfferId = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `OFF-${y}${m}${day}-${rand}`;
};

const calcPrice = (o: NewOffer) =>
  o.antal_fonster * 50 +
  (o.hojd * o.bredd) / 1000 +
  (o.sprojs ? o.antal_fonster * 10 : 0);

/* =========================
   PAGE
========================= */

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [sendingId, setSendingId] = useState<string | number | null>(null);

  const [editOffer, setEditOffer] = useState<Offer | null>(null);

  const [newOffer, setNewOffer] = useState<NewOffer>({
    namn: "",
    email: "",
    antal_fonster: 1,
    hojd: 100,
    bredd: 100,
    sprojs: false,
  });

  /* =========================
     FETCH
  ========================= */

  const fetchOffers = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false });

    setOffers(
      (data || []).map((o: any) => ({
        ...o,
        status: normalizeStatus(o.status),
      }))
    );

    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  /* =========================
     CREATE
  ========================= */

  const createOffer = async () => {
    setCreating(true);

    await supabase.from("offers").insert([
      {
        ...newOffer,
        offert_id: generateOfferId(),
        pris: calcPrice(newOffer),
        status: "utkast",
      },
    ]);

    setNewOffer({
      namn: "",
      email: "",
      antal_fonster: 1,
      hojd: 100,
      bredd: 100,
      sprojs: false,
    });

    await fetchOffers();
    setCreating(false);
  };

  /* =========================
     SEND
  ========================= */

  const sendOffer = async (offer: Offer) => {
    setSendingId(offer.id);

    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(offer),
    });

    await supabase
      .from("offers")
      .update({ status: "skickad" })
      .eq("id", offer.id);

    fetchOffers();
    setSendingId(null);
  };

  /* =========================
     DELETE
  ========================= */

  const deleteOffer = async (id: string | number) => {
    if (!confirm("Ta bort offert?")) return;
    await supabase.from("offers").delete().eq("id", id);
    fetchOffers();
  };

  /* =========================
     EDIT SAVE
  ========================= */

  const saveEdit = async () => {
    if (!editOffer) return;

    await supabase
      .from("offers")
      .update(editOffer)
      .eq("id", editOffer.id);

    setEditOffer(null);
    fetchOffers();
  };

  /* =========================
     PDF
  ========================= */

  const downloadPDF = async (offer: Offer) => {
    const element = document.getElementById(`pdf-${offer.id}`);
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const width = 210;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${offer.offert_id}.pdf`);
  };

  /* =========================
     FILTER
  ========================= */

  const filtered = offers.filter((o) =>
    `${o.offert_id} ${o.namn} ${o.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* =========================
     UI
  ========================= */

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
        <div style={styles.form}>
          <h3>➕ Ny offert</h3>

          <input
            style={styles.input}
            placeholder="Namn"
            value={newOffer.namn}
            onChange={(e) =>
              setNewOffer({ ...newOffer, namn: e.target.value })
            }
          />

          <input
            style={styles.input}
            placeholder="Email"
            value={newOffer.email}
            onChange={(e) =>
              setNewOffer({ ...newOffer, email: e.target.value })
            }
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Antal fönster"
            value={newOffer.antal_fonster}
            onChange={(e) =>
              setNewOffer({
                ...newOffer,
                antal_fonster: Number(e.target.value),
              })
            }
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Bredd"
            value={newOffer.bredd}
            onChange={(e) =>
              setNewOffer({ ...newOffer, bredd: Number(e.target.value) })
            }
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Höjd"
            value={newOffer.hojd}
            onChange={(e) =>
              setNewOffer({ ...newOffer, hojd: Number(e.target.value) })
            }
          />

          <button onClick={createOffer} style={styles.createBtn}>
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
                <b>{o.offert_id}</b>

                <span
                  style={{
                    ...styles.status,
                    background:
                      o.status === "skickad" ? "#14532d" : "#1f2a44",
                  }}
                >
                  {o.status === "skickad" ? "Skickad" : "Utkast"}
                </span>
              </div>

              <p>{o.namn}</p>
              <p>{o.email}</p>
              <p>{o.pris} kr</p>

              <div style={styles.row}>
                <button
                  style={{
                    ...styles.sendBtn,
                    background:
                      o.status === "skickad" ? "#14532d" : "#4f7cff",
                  }}
                  onClick={() => sendOffer(o)}
                >
                  {o.status === "skickad" ? "Skicka igen" : "Skicka"}
                </button>

                {/* ✅ RESTORED EDIT BUTTON */}
                <button
                  style={styles.editBtn}
                  onClick={() => setEditOffer(o)}
                >
                  Redigera
                </button>

                <button
                  style={styles.pdfBtn}
                  onClick={() => downloadPDF(o)}
                >
                  PDF
                </button>

                <button
                  style={styles.dangerBtn}
                  onClick={() => deleteOffer(o.id)}
                >
                  Ta bort
                </button>
              </div>
            </div>
          ))
        )}

        {/* EDIT MODAL (RESTORED FULLY) */}
        {editOffer && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h3>Redigera offert</h3>

              <p style={{ fontSize: 12, opacity: 0.6 }}>
                {editOffer.offert_id}
              </p>

              <input
                style={styles.input}
                value={editOffer.namn}
                onChange={(e) =>
                  setEditOffer({ ...editOffer, namn: e.target.value })
                }
              />

              <input
                style={styles.input}
                value={editOffer.email}
                onChange={(e) =>
                  setEditOffer({ ...editOffer, email: e.target.value })
                }
              />

              <input
                style={styles.input}
                type="number"
                value={editOffer.antal_fonster}
                onChange={(e) =>
                  setEditOffer({
                    ...editOffer,
                    antal_fonster: Number(e.target.value),
                  })
                }
              />

              <input
                style={styles.input}
                type="number"
                value={editOffer.bredd}
                onChange={(e) =>
                  setEditOffer({ ...editOffer, bredd: Number(e.target.value) })
                }
              />

              <input
                style={styles.input}
                type="number"
                value={editOffer.hojd}
                onChange={(e) =>
                  setEditOffer({ ...editOffer, hojd: Number(e.target.value) })
                }
              />

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={editOffer.sprojs}
                  onChange={(e) =>
                    setEditOffer({
                      ...editOffer,
                      sprojs: e.target.checked,
                    })
                  }
                />
                Spröjs
              </label>

              <button onClick={saveEdit} style={styles.createBtn}>
                Spara
              </button>

              <button
                onClick={() => setEditOffer(null)}
                style={styles.dangerBtn}
              >
                Stäng
              </button>
            </div>
          </div>
        )}

        {/* PDF TEMPLATES */}
        {offers.map((o) => (
          <div key={o.id} id={`pdf-${o.id}`} style={styles.pdf}>
            <h1>OFFERT</h1>
            <p>{o.offert_id}</p>
            <p>{o.namn}</p>
            <p>{o.email}</p>
            <p>{o.antal_fonster} fönster</p>
            <p>{o.bredd} x {o.hojd} cm</p>
            <p>Spröjs: {o.sprojs ? "Ja" : "Nej"}</p>
            <h2>{o.pris} kr</h2>
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
  page: { background: "#0b1220", minHeight: "100vh", color: "white", padding: 24 },
  container: { maxWidth: 1100, margin: "0 auto" },

  title: { fontSize: 28, marginBottom: 20 },

  form: {
    background: "#121a2b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  input: {
    padding: 10,
    borderRadius: 8,
    background: "#0f172a",
    color: "white",
    border: "1px solid #1f2a44",
  },

  search: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },

  card: {
    background: "#121a2b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  topRow: { display: "flex", justifyContent: "space-between" },

  row: { display: "flex", gap: 10, marginTop: 10 },

  sendBtn: {
    flex: 1,
    padding: 10,
    color: "white",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },

  editBtn: {
    flex: 1,
    padding: 10,
    background: "#f59e0b",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },

  pdfBtn: {
    flex: 1,
    padding: 10,
    background: "#111827",
    color: "white",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },

  dangerBtn: {
    flex: 1,
    padding: 10,
    background: "#2a0f14",
    color: "#ff5c5c",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },

  createBtn: {
    padding: 12,
    background: "#4f7cff",
    color: "white",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },

  status: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
  },

  checkboxLabel: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginTop: 6,
  },

  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    background: "#121a2b",
    padding: 20,
    borderRadius: 12,
    width: 420,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  pdf: {
    position: "absolute",
    left: "-9999px",
    width: 600,
    background: "white",
    color: "black",
    padding: 40,
  },
};