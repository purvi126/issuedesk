"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Section = "HOSTEL" | "CAMPUS";

export default function SectionPageInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "";

  const [picked, setPicked] = useState<Section>("HOSTEL");

  function choose(section: Section) {
    setPicked(section);
    localStorage.setItem("issuedesk_section", section);
    localStorage.setItem("issuedesk_domain", section);

    if (section === "HOSTEL") {
      router.push("/setup/gender");
    } else {
      router.push(`/setup/location${next ? `?next=${encodeURIComponent(next)}` : ""}`);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Choose section
        </h1>
        <p className="mt-2 text-sm text-white/60">Tap one to continue.</p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <ChoiceCard
              title="Hostel"
              img="/illus/hostel.png"
              active={picked === "HOSTEL"}
              onClick={() => choose("HOSTEL")}
            />
            <ChoiceCard
              title="Campus"
              img="/illus/campus.png"
              active={picked === "CAMPUS"}
              onClick={() => choose("CAMPUS")}
            />
          </div>

          {next ? (
            <div className="mt-4 text-xs text-white/45">
              After setup, you’ll be redirected to:{" "}
              <span className="text-white/70">{next}</span>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function ChoiceCard({
  title,
  img,
  active,
  onClick,
}: {
  title: string;
  img: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-6 text-center transition",
        active
          ? "border-blue-400/30 bg-blue-500/10"
          : "border-white/10 bg-white/5 hover:border-blue-400/25 hover:bg-blue-500/5",
      ].join(" ")}
    >
      <div className="relative mx-auto mb-3 h-40 w-40 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <Image src={img} alt={title} fill className="object-contain p-3" />
      </div>
      <div className="text-lg font-semibold text-white/90">{title}</div>
      <div className="mt-1 text-sm text-white/55">Tap to select</div>
    </button>
  );
}