import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMedia, useSettings } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MorganShotIt Studio" },
      { name: "description", content: "Meet Morgan, the photographer and filmmaker behind MorganShotIt Studio in Fedha along Outer Ring road, Kenya." },
      { property: "og:title", content: "About — MorganShotIt Studio" },
      { property: "og:description", content: "The story and studio behind MorganShotIt." },
    ],
  }),
  component: About,
});

function About() {
  const { items } = useMedia();
  const s = useSettings();
  const img = items.find((i) => i.kind === "image")?.url ?? s.hero;
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <img src={img} alt="MorganShotIt work" className="aspect-[4/5] w-full rounded-3xl object-cover" />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">About</p>
          <h1 className="mt-3 font-display text-6xl">Hi, I'm <em className="text-gold">Morgan</em>.</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            I photograph people at their most alive — the laughter, the nerves, the quiet in-between moments. MorganShotIt Studio blends
            documentary honesty with a cinematic eye so your photos feel like scenes from your own film.
          </p>
          <div className="mt-10 space-y-4 text-muted-foreground">
            <p className="flex gap-3"><MapPin className="shrink-0 text-primary" /> Fedha along Outer Ring road · available to travel</p>
            <p className="flex gap-3"><Clock className="text-primary" /> Mon – Sun, by appointment</p>
            <p className="flex gap-3"><MessageCircle className="text-primary" /> Chat on WhatsApp anytime</p>
          </div>
          <div className="mt-10 flex gap-3">
            <Button asChild variant="hero" size="lg"><Link to="/book">Book a session</Link></Button>
            <Button asChild variant="glass" size="lg"><a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
