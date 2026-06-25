"use client";

import { useEffect, useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LoginView } from "@/components/LoginView";

export default function Home() {
  const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setAuthStatus("authenticated");
            return;
          }
        }
        setAuthStatus("unauthenticated");
      } catch (err) {
        setAuthStatus("unauthenticated");
      }
    };
    checkSession();
  }, []);

  if (authStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary-blue)] border-t-transparent" />
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return <LoginView onLoginSuccess={() => setAuthStatus("authenticated")} />;
  }

  return <KanbanBoard onLogout={() => setAuthStatus("unauthenticated")} />;
}
