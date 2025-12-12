import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import type { FormEvent } from "react";
import { ensureSupabaseClient } from "../lib/supabaseClient";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = ensureSupabaseClient();
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Unable to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>ShortPulse · Sign in</title>
      </Head>
      <main className="page page-wide">
        <div className="page-top">
          <Link href="/" className="ghost-btn small">
            ← Back to dashboard
          </Link>
        </div>

        <section className="panel auth-panel">
          <h1 className="title">Sign {mode === "signin" ? "in" : "up"}</h1>
          <p className="subdued">
            Use your email and password to {mode === "signin" ? "access" : "create"} your ShortPulse workspace.
          </p>
          <form className="creator-form" onSubmit={onSubmit}>
            <div className="input-chip">
              <label className="tiny subdued" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-chip">
              <label className="tiny subdued" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="creator-form-actions">
              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? "Working…" : mode === "signin" ? "Sign in" : "Sign up"}
              </button>
            </div>
          </form>
          {error && <p className="subdued tiny" style={{ marginTop: 8 }}>{error}</p>}
          <div className="cap-chips" style={{ marginTop: 12 }}>
            {mode === "signin" ? (
              <button className="ghost-btn small" type="button" onClick={() => setMode("signup")}>
                Need an account? Sign up
              </button>
            ) : (
              <button className="ghost-btn small" type="button" onClick={() => setMode("signin")}>
                Have an account? Sign in
              </button>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

