"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type Section = "HOSTEL" | "CAMPUS";

export default function NewIssuePage() {
  const router = useRouter();

  function choose(section: Section) {
    localStorage.setItem("issuedesk_draft_step1", JSON.stringify({ section }));
    router.push("/new/location");
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          First, we need your location
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Choose where the issue is happening.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <ChoiceCard
              title="Hostel"
              img="/illus/hostel.png"
              onClick={() => choose("HOSTEL")}
            />
            <ChoiceCard
              title="Campus"
              img="/illus/campus.png"
              onClick={() => choose("CAMPUS")}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function ChoiceCard({
  title,
  img,
  onClick,
}: {
  title: string;
  img: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-cyan-400/25 hover:bg-cyan-500/5"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <Image src={img} alt={title} fill className="object-contain p-3" />
      </div>

      <div className="text-lg font-semibold text-white/90">{title}</div>
    </button>
  );
}