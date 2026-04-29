"use client";

import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="sv">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}