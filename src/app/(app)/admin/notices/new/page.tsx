"use client";

import { useState } from "react";

export default function NewNoticePage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-black tracking-tight">New notice</h1>
        <p className="mt-1 text-sm text-white/60">
          Demo-only. Admins will publish notices here.
        </p>

        <div className="mt-6 rounded-3xl border border-[color:rgba(38,198,255,0.28)] bg-[linear-gradient(135deg,rgba(38,198,255,0.08),rgba(0,0,0,0))] p-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-white/80">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., Water shutdown"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-white/80">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Type notice details…"
              />
            </div>

            <button
              disabled
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/40 cursor-not-allowed"
              title="Demo placeholder"
            >
              Publish (demo)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}