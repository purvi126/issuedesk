"use client";

import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

export default function AppHeader() {
  const { data } = useSession();

  const email = data?.user?.email ?? "";
  const name = data?.user?.name ?? "User";
  const avatar = data?.user?.image ?? "";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(10px)",
        background: "rgba(0,0,0,0.22)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: 14,
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {avatar ? (
            <Image
              src={avatar}
              alt="Profile"
              width={28}
              height={28}
              style={{ borderRadius: 999, border: "1px solid var(--border)" }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "rgba(0, 190, 255, 0.15)",
              }}
            />
          )}

          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 900, fontSize: 13 }}>{name}</div>
            <div style={{ fontWeight: 800, fontSize: 12, color: "var(--muted)" }}>
              {email || "signed in"}
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              marginLeft: 6,
              padding: "8px 10px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "rgba(0,0,0,0.35)",
              color: "var(--text)",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}