"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (!error) {
      alert("Konto skapat!");
      router.push("/login");
    } else {
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Register</h1>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={register}>Skapa konto</button>
    </div>
  );
}