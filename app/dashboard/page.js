"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  // 📊 fake data (byt senare mot Supabase)
  const revenueData = [
    { name: "Mon", value: 1200 },
    { name: "Tue", value: 1900 },
    { name: "Wed", value: 800 },
    { name: "Thu", value: 2400 },
    { name: "Fri", value: 3200 },
    { name: "Sat", value: 2800 },
    { name: "Sun", value: 4000 },
  ];

  const statusData = [
    { name: "Draft", value: 12 },
    { name: "Sent", value: 34 },
    { name: "Accepted", value: 18 },
    { name: "Rejected", value: 6 },
  ];

  return (
    <div style={styles.page}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Dashboard</h1>
        <p style={styles.subtitle}>Översikt över din verksamhet</p>
      </div>

      {/* KPI CARDS */}
      <div style={styles.kpiGrid}>
        <KPI title="Revenue" value="42 500 kr" change="+12%" />
        <KPI title="Offers" value="64" change="+5%" />
        <KPI title="Conversion" value="28%" change="+2%" />
        <KPI title="Growth" value="+18%" change="+8%" />
      </div>

      {/* CHARTS */}
      <div style={styles.grid}>
        
        {/* LINE CHART */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Revenue trend</h3>

          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4f7cff"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Offer status</h3>

          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4f7cff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

/* 🧱 KPI COMPONENT */
function KPI({ title, value, change }) {
  return (
    <div style={styles.kpiCard}>
      <p style={styles.kpiTitle}>{title}</p>
      <h2 style={styles.kpiValue}>{value}</h2>
      <span style={styles.kpiChange}>{change}</span>
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  page: {
    padding: "24px",
    maxWidth: 1200,
    margin: "0 auto",
    color: "white",
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    marginBottom: 4,
  },

  subtitle: {
    color: "#9aa4b2",
    fontSize: 14,
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 20,
  },

  kpiCard: {
    background: "#121a2b",
    padding: 16,
    borderRadius: 14,
    border: "1px solid #1f2a44",
  },

  kpiTitle: {
    fontSize: 12,
    color: "#9aa4b2",
  },

  kpiValue: {
    fontSize: 22,
    margin: "6px 0",
  },

  kpiChange: {
    fontSize: 12,
    color: "#4f7cff",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 12,
  },

  card: {
    background: "#121a2b",
    padding: 16,
    borderRadius: 16,
    border: "1px solid #1f2a44",
  },

  cardTitle: {
    fontSize: 14,
    marginBottom: 12,
    color: "#cbd5e1",
  },
};