"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/app/lib/supabase/client";
import router from "next/router";

export default function LoginPage() {
  const supabase = createBrowserSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.replace("/");
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-semibold mb-4">Dev Login</h1>

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          className="w-full border p-2"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border p-2"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}

        <button className="w-full bg-black text-white py-2">Login</button>
      </form>
    </div>
  );
}
