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
  // ✅ FIX: tillåt både User och null
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        setUser(null);
        return;
      }

      setUser(data?.user ?? null);
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