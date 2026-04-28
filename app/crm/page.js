"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

const COLUMNS = [
  { id: "draft", title: "📝 Utkast" },
  { id: "sent", title: "📤 Skickade" },
  { id: "waiting", title: "⏳ Väntar" },
  { id: "approved", title: "✅ Godkända" },
  { id: "rejected", title: "❌ Nekade" },
];

export default function CRMBoard() {
  const [offers, setOffers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);

  const [newOffer, setNewOffer] = useState({
    name: "",
    email: "",
    antal_fonster: 0,
    hojd: 0,
    bredd: 0,
    sprojs: false,
  });

  /* =========================
     FETCH
  ========================= */
  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
      return;
    }

    setOffers(data || []);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  /* =========================
     PRICE CALC
  ========================= */
  const calcPrice = (o) => {
    const f = Number(o.antal_fonster) || 0;
    const h = Number(o.hojd) || 0;
    const b = Number(o.bredd) || 0;

    return f * 50 + (h * b) / 1000 + (o.sprojs ? f * 10 : 0);
  };

  /* =========================
     CREATE CUSTOMER (API)
  ========================= */
  const createCustomer = async () => {
    const res = await fetch("/api/customers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newOffer.name,
        email: newOffer.email,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    return data;
  };

  /* =========================
     CREATE OFFER FLOW
  ========================= */
  const createOffer = async () => {
    setCreating(true);

    try {
      // 1. skapa / hämta kund via API
      const customer = await createCustomer();

      if (!customer?.id) {
        throw new Error("Customer ID missing");
      }

      // 2. skapa offert
      const offer = {
        customer_id: customer.id,
        offert_id: `OFF-${Date.now()}`,
        namn: newOffer.name,
        email: newOffer.email,
        antal_fonster: Number(newOffer.antal_fonster),
        hojd: Number(newOffer.hojd),
        bredd: Number(newOffer.bredd),
        sprojs: newOffer.sprojs,
        pris: calcPrice(newOffer),
        status: "draft",
      };

      const { error } = await supabase
        .from("offers")
        .insert([offer]);

      if (error) {
        throw new Error(error.message);
      }

      // reset form
      setNewOffer({
        name: "",
        email: "",
        antal_fonster: 0,
        hojd: 0,
        bredd: 0,
        sprojs: false,
      });

      await fetchOffers();
    } catch (err) {
      console.error("Create error:", err.message);
    }

    setCreating(false);
  };

  /* =========================
     DRAG & DROP
  ========================= */
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const newStatus = result.destination.droppableId;

    await supabase
      .from("offers")
      .update({ status: newStatus })
      .eq("id", result.draggableId);

    setOffers((prev) =>
      prev.map((o) =>
        o.id === result.draggableId
          ? { ...o, status: newStatus }
          : o
      )
    );
  };

  const getColumnItems = (status) =>
    offers.filter((o) => (o.status || "draft") === status);

  /* =========================
     UI
  ========================= */
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📊 CRM Board</h1>

      {/* CREATE */}
      <div style={styles.createBox}>
        <input
          placeholder="Namn"
          value={newOffer.name}
          onChange={(e) =>
            setNewOffer({ ...newOffer, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          value={newOffer.email}
          onChange={(e) =>
            setNewOffer({ ...newOffer, email: e.target.value })
          }
        />

        <button
          onClick={createOffer}
          disabled={creating}
          style={styles.primaryBtn}
        >
          {creating ? "Skapar..." : "Skapa offert"}
        </button>
      </div>

      {/* BOARD */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={styles.board}>
          {COLUMNS.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={styles.column}
                >
                  <h3>{col.title}</h3>

                  {getColumnItems(col.id).map((o, i) => (
                    <Draggable
                      key={o.id}
                      draggableId={String(o.id)}
                      index={i}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...styles.card,
                            ...provided.draggableProps.style,
                          }}
                          onClick={() => setSelected(o)}
                        >
                          <b>{o.namn}</b>
                          <p>{o.email}</p>
                          <p>💰 {o.pris} kr</p>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    padding: 20,
    color: "white",
    background: "#0b1220",
    minHeight: "100vh",
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
  },

  board: {
    display: "flex",
    gap: 12,
    overflowX: "auto",
  },

  column: {
    minWidth: 260,
    background: "#121a2b",
    padding: 10,
    borderRadius: 10,
  },

  card: {
    background: "#1f2a44",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },

  createBox: {
    marginBottom: 20,
    display: "flex",
    gap: 10,
  },

  primaryBtn: {
    padding: 10,
    background: "#4f7cff",
    color: "white",
    border: "none",
    borderRadius: 8,
  },
};