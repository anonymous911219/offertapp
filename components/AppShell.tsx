"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { CSSProperties } from "react";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser: User | null = data?.user ?? null;
setUser(currentUser);
    };

    getUser();

    // 🔥 LIVE auth sync (fixar UI-buggar)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div style={styles.body}>
      {/* OVERLAY */}
      {menuOpen && (
        <div style={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside
        style={{
          ...styles.sidebar,
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <nav style={styles.nav}>
          <NavLink href="/dashboard" label="📈 Panel" current={pathname} onClick={() => setMenuOpen(false)} />
          <NavLink href="/offers" label="📋 Offerter" current={pathname} onClick={() => setMenuOpen(false)} />
          <NavLink href="/crm" label="📊 CRM" current={pathname} onClick={() => setMenuOpen(false)} />
          <NavLink href="/customers" label="👥 Kunder" current={pathname} onClick={() => setMenuOpen(false)} />
          <NavLink href="/settings" label="⚙️ Inställningar" current={pathname} onClick={() => setMenuOpen(false)} />
        </nav>
      </aside>

      {/* MAIN */}
      <div
        style={{
          ...styles.mainArea,
          marginLeft: menuOpen ? 240 : 0,
        }}
      >
        {/* TOPBAR */}
        <div style={styles.topBar}>
          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          <div style={{ flex: 1 }} />

          {/* USER */}
          <div style={{ position: "relative" }}>
            <div style={styles.avatar} onClick={() => setOpen(!open)}>
              {(user?.email?.charAt(0) ?? "?").toUpperCase()}
            </div>

            {open && (
              <div style={styles.dropdown}>
                <p style={styles.email}>
                  {user?.email ?? "Ej inloggad"}
                </p>

                <button style={styles.dropdownBtn} onClick={logout}>
                  🚪 Logga ut
                </button>
              </div>
            )}
          </div>
        </div>

        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

/* NAV */
function NavLink({
  href,
  label,
  current,
  onClick,
}: {
  href: string;
  label: string;
  current: string;
  onClick: () => void;
}) {
  const active =
    current === href || current.startsWith(href + "/");

  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        ...styles.link,
        background: active ? "#4f7cff" : "#121a2b",
      }}
    >
      {label}
    </a>
  );
}

/* STYLES */
const styles: Record<string, CSSProperties> = {
  body: {
    margin: 0,
    fontFamily: "sans-serif",
    background: "#0b1220",
    color: "white",
  },

  sidebar: {
    width: 240,
    background: "#0f172a",
    padding: 20,
    borderRight: "1px solid #1f2a44",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    transition: "transform 0.25s ease",
    zIndex: 1000,
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 40,
  },

  link: {
    padding: 12,
    borderRadius: 10,
    color: "white",
    textDecoration: "none",
    display: "block",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },

  mainArea: {
    display: "flex",
    flexDirection: "column",
    transition: "margin-left 0.25s ease",
  },

  topBar: {
    display: "flex",
    alignItems: "center",
    padding: 16,
    background: "#0f172a",
    borderBottom: "1px solid #1f2a44",
  },

  content: {
    padding: 30,
  },

  hamburger: {
    fontSize: 22,
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#4f7cff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: "bold",
  },

  dropdown: {
    position: "absolute",
    right: 0,
    top: 50,
    background: "#0f172a",
    padding: 10,
    borderRadius: 10,
    width: 200,
    zIndex: 2000,
  },

  email: {
    fontSize: 12,
    opacity: 0.7,
    margin: 0,
  },

  dropdownBtn: {
    marginTop: 8,
    width: "100%",
    padding: 8,
    background: "#1f2a44",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};