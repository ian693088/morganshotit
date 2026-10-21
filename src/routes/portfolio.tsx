import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMedia, CATEGORIES, type MediaItem } from "@/lib/content";
import { MediaTile, Lightbox } from "@/components/MediaTile";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Portfolio — MorganShotIt Studio" },
      { name: "description", content: "Browse weddings, birthdays, graduations, anniversaries, portraits and cinematic films." },
      { property: "og:title", content: "Portfolio — MorganShotIt Studio" },
      { property: "og:description", content: "Photos and films from real MorganShotIt sessions." },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const { items } = useMedia();
  const [cat, setCat] = useState<string>("All");
  const [kind, setKind] = useState<"all" | "image" | "video">("all");
  const [open, setOpen] = useState<MediaItem | null>(null);
  const list = items.filter((i) => (cat === "All" || i.category === cat) && (kind === "all" || i.kind === kind));

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36">
      <p className="text-xs uppercase tracking-[0.3em] text-primary">Portfolio</p>
      <h1 className="mt-3 font-display text-6xl md:text-7xl">The gallery</h1>

      <div className="mt-10 flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`rounded-full border px-4 py-2 text-sm transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {c}
          </button>
        ))}
        <span className="mx-2 w-px bg-border" />
        {(["all", "image", "video"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)}
            className={`rounded-full border px-4 py-2 text-sm capitalize transition ${kind === k ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
            {k === "all" ? "Photos & videos" : k === "image" ? "Photos" : "Videos"}
          </button>
        ))}
      </div>

      <div className="mt-10 columns-2 gap-3 md:columns-3 [&>*]:mb-3">
        {list.map((it) => <MediaTile key={it.id} item={it} onClick={() => setOpen(it)} className="break-inside-avoid" />)}
      </div>
      {list.length === 0 && <p className="mt-16 text-center text-muted-foreground">Nothing here yet — check back soon.</p>}
      <Lightbox item={open} onClose={() => setOpen(null)} />
    </div>
  );
}
