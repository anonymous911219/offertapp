"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.log(error);
        router.replace("/login");
        return;
      }

      if (data?.user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    };

    run();
  }, [router]);

  return (
    <div style={styles.page}>
      <p>Startar app...</p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0b1220",
    color: "white",
    fontFamily: "sans-serif",
  },
};