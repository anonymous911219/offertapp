"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth error:", error.message);
        if (mounted) setUser(null);
        return;
      }

      if (mounted) {
        setUser(data.user ?? null);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <div style={styles.userBox}>
          <div style={styles.avatar}>
            {(user?.email?.charAt(0) ?? "?").toUpperCase()}
          </div>

          <div>
            <p style={styles.userLabel}>Inloggad som</p>
            <p style={styles.userEmail}>{user?.email ?? "..."}</p>
          </div>
        </div>

        <button style={styles.logoutBtn} onClick={logout}>
          Logga ut
        </button>
      </div>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

/* STYLES */
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    background: "#0b1220",
    color: "white",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #1f2a44",
    background: "#0f172a",
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#4f7cff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  userLabel: {
    fontSize: 11,
    color: "#9aa4b2",
    margin: 0,
  },

  userEmail: {
    fontSize: 13,
    margin: 0,
  },

  logoutBtn: {
    padding: "8px 14px",
    background: "#1f2a44",
    color: "white",
    border: "1px solid #2a3550",
    borderRadius: 8,
    cursor: "pointer",
  },

  main: {
    padding: "20px clamp(12px, 2vw, 30px)",
  },
};