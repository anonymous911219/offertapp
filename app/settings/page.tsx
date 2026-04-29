"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

/* =========================
   TYPES
========================= */

type Settings = {
  company_name: string;
  email_notifications: boolean;
  auto_create_customer: boolean;
  auto_send_offer: boolean;
  ai_scoring: boolean;
  default_margin: number;
  vat: number;
  currency: string;
};

/* =========================
   COMPONENT
========================= */

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    company_name: "",
    email_notifications: true,
    auto_create_customer: true,
    auto_send_offer: false,
    ai_scoring: true,
    default_margin: 30,
    vat: 25,
    currency: "SEK",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  /* =========================
     FETCH
  ========================= */
  const fetchSettings = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    if (!error && data) {
      setSettings(data as Settings);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  /* =========================
     SAVE
  ========================= */
  const saveSettings = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("settings")
      .upsert(settings);

    if (error) {
      console.error("Save error:", error.message);
    }

    setSaving(false);
  };

  /* =========================
     UI
  ========================= */
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>⚙️ Inställningar</h1>

      {loading ? (
        <p>Laddar...</p>
      ) : (
        <div style={styles.grid}>
          {/* COMPANY */}
          <div style={styles.card}>
            <h3>🏢 Företag</h3>

            <Input
              label="Företagsnamn"
              value={settings.company_name}
              onChange={(v) =>
                setSettings({ ...settings, company_name: v })
              }
            />
          </div>

          {/* AUTOMATION */}
          <div style={styles.card}>
            <h3>🤖 Automation</h3>

            <Toggle
              label="Auto skapa kund"
              value={settings.auto_create_customer}
              onChange={(v) =>
                setSettings({ ...settings, auto_create_customer: v })
              }
            />

            <Toggle
              label="Auto skicka offert"
              value={settings.auto_send_offer}
              onChange={(v) =>
                setSettings({ ...settings, auto_send_offer: v })
              }
            />

            <Toggle
              label="AI lead scoring"
              value={settings.ai_scoring}
              onChange={(v) =>
                setSettings({ ...settings, ai_scoring: v })
              }
            />
          </div>

          {/* PRICING */}
          <div style={styles.card}>
            <h3>💰 Prissättning</h3>

            <Input
              label="Standardmarginal (%)"
              type="number"
              value={settings.default_margin}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  default_margin: Number(v),
                })
              }
            />

            <Input
              label="Moms (%)"
              type="number"
              value={settings.vat}
              onChange={(v) =>
                setSettings({ ...settings, vat: Number(v) })
              }
            />

            <Input
              label="Valuta"
              value={settings.currency}
              onChange={(v) =>
                setSettings({ ...settings, currency: v })
              }
            />
          </div>

          {/* NOTIFICATIONS */}
          <div style={styles.card}>
            <h3>🔔 Notifikationer</h3>

            <Toggle
              label="Email notiser"
              value={settings.email_notifications}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  email_notifications: v,
                })
              }
            />
          </div>
        </div>
      )}

      <button
        style={styles.saveBtn}
        onClick={saveSettings}
        disabled={saving}
      >
        {saving ? "Sparar..." : "Spara inställningar"}
      </button>
    </div>
  );
}

/* =========================
   UI COMPONENTS
========================= */

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        style={styles.input}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={styles.toggle}>
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value ?? false}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

/* =========================
   STYLES
========================= */

const styles: Record<string, CSSProperties> = {
  page: {
    padding: 24,
    color: "white",
    background: "#0b1220",
    minHeight: "100vh",
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 12,
  },

  card: {
    background: "#121a2b",
    padding: 16,
    borderRadius: 14,
    border: "1px solid #1f2a44",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    color: "#9aa4b2",
  },

  input: {
    padding: 10,
    borderRadius: 8,
    background: "#0b1220",
    color: "white",
    border: "1px solid #24314a",
  },

  toggle: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #1f2a44",
  },

  saveBtn: {
    marginTop: 20,
    padding: 12,
    background: "#4f7cff",
    border: "none",
    color: "white",
    borderRadius: 10,
    cursor: "pointer",
  },
};