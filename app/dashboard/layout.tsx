"use client";

import "./globals.css";
import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ VIKTIG FIX: explicit typ (detta löser allt)
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      // 👇 säkrare än data?.user || null
      setUser(data.user ?? null);
    };

    getUser();
  }, []);

  return (
    <html lang="sv">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}