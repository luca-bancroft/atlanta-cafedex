"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "../components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setPending(false);

    if (!result || result.error) {
      setError("Incorrect username or password.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="login-page">
        <form className="login-card" onSubmit={handleSubmit}>
          <h1 className="login-card-title">Log in</h1>
          <p className="login-card-subtitle">
            Cafedex is in closed beta - accounts are invite-only for now.
          </p>
          <label className="login-field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="login-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-submit" disabled={pending}>
            {pending ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
