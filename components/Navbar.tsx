"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error.message);
        return;
      }

      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Unexpected logout error:", err);
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
      
      {/* LOGGA */}
      <div className="text-xl font-semibold text-slate-800">
        CRM
      </div>

      {/* HÖGER SIDE */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLogout}
          className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg
                     hover:bg-red-50 transition text-sm font-medium"
        >
          Logga ut
        </button>
      </div>
    </nav>
  );
}