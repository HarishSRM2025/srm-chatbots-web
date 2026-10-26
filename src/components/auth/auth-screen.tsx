"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
export function AuthScreen() {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError("");
    try {
      if (register)
        await api("auth/register/", {
          method: "POST",
          body: JSON.stringify(data),
        });
      await api("auth/login/", {
        method: "POST",
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });
      const target =
        new URLSearchParams(window.location.search).get("next") || "/";
      const allowed = [
        "/",
        "/agents",
        "/knowledge",
        "/conversations",
        "/analytics",
        "/integrations",
      ];
      const path = target.split("?")[0];
      router.replace(allowed.includes(path) ? target : "/");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth">
      <section className="auth-story">
        <div className="brand">
          <span className="brand-icon">
            <Bot />
          </span>
          SRM <span>chatbots</span>
        </div>
        <div>
          <span className="eyebrow">YOUR KNOWLEDGE. ALWAYS AVAILABLE.</span>
          <h1>
            A better answer
            <br />
            starts here.
          </h1>
          <p>
            Bring your institution’s knowledge together.
            <br />
            Build assistants that make every conversation count.
          </p>
          <div className="auth-illustration">
            <Sparkles size={32} />
            <div className="sample-bubble">How can I help you today?</div>
            <div className="sample-bubble small">
              Admissions. Academics. And everything in between.
            </div>
          </div>
        </div>
        <small>One workspace. More helpful conversations.</small>
      </section>
      <section className="auth-form">
        <div className="auth-inner">
          <span className="eyebrow">SRM WORKSPACE</span>
          <h2>{register ? "Create your account" : "Welcome back"}</h2>
          <p className="muted">
            {register
              ? "Start building your first AI assistant."
              : "Sign in to manage your AI assistants."}
          </p>
          {error && (
            <div className="alert error" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={authenticate}>
            {register && (
              <div className="form-row">
                <label>
                  First name
                  <input name="first_name" autoComplete="given-name" />
                </label>
                <label>
                  Last name
                  <input name="last_name" autoComplete="family-name" />
                </label>
              </div>
            )}
            <label>
              Username
              <input
                name="username"
                required
                autoComplete="username"
                maxLength={150}
              />
            </label>
            {register && (
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
            )}
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                minLength={register ? 8 : 1}
                autoComplete={register ? "new-password" : "current-password"}
              />
            </label>
            {register && (
              <label>
                Confirm password
                <input
                  name="password_confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                />
              </label>
            )}
            <button className="primary full" disabled={busy}>
              {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to the workspace?"}{" "}
            <button
              onClick={() => {
                setRegister(!register);
                setError("");
              }}
            >
              {register ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
