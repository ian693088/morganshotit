import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Star, Heart, Cake, GraduationCap, Sparkles, Camera, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMedia, useSettings, PACKAGES, ksh, type MediaItem } from "@/lib/content";
import { MediaTile, Lightbox } from "@/components/MediaTile";
import { EnquiryDialog } from "@/components/EnquiryDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MorganShotIt Studio — Capture Your Story" },
      { name: "description", content: "Cinematic wedding, birthday, graduation and portrait photography. Book your session and pay via M-Pesa." },
      { property: "og:title", content: "MorganShotIt Studio — Capture Your Story" },
      { property: "og:description", content: "Cinematic photography & film for the moments worth reliving." },
    ],
  }),
  component: Index,
});

const testimonials = [
  { name: "Wanjiru & Brian", text: "Morgan captured our wedding like a movie. Every guest asked who our photographer was.", tag: "Wedding" },
  { name: "Aisha K.", text: "My graduation photos are unreal. Professional, fun, and delivered so fast.", tag: "Graduation" },
  { name: "The Otieno Family", text: "We booked the Cinematic package for our anniversary — the highlight film made us cry.", tag: "Anniversary" },
];

function Index() {
  const s = useSettings();
  const { items } = useMedia();
  const [open, setOpen] = useState<MediaItem | null>(null);
  const featured = (items.filter((i) => i.featured).length >= 4 ? items.filter((i) => i.featured) : items).slice(0, 7);
  const marquee = items.filter((i) => i.kind === "image").slice(0, 10);

  return (
    <>
      {/* Hero */}
      <section className="relative grid min-h-[100svh] place-items-center overflow-hidden grain">
        {s.heroVideo ? (
          <video src={s.heroVideo} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <img src={s.hero} alt="" className="absolute inset-0 h-full w-full object-cover animate-kenburns" />
        )}
        <div className="absolute inset-0 bg-fade" />
        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
          <p className="animate-rise text-xs uppercase tracking-[0.4em] text-primary">Photography · Cinematic · Memories</p>
          <h1 className="animate-rise mt-6 font-display text-6xl leading-[0.95] md:text-8xl" style={{ animationDelay: "120ms" }}>
            {s.tagline.split(" ").slice(0, -1).join(" ")} <em className="text-gold">{s.tagline.split(" ").slice(-1)}</em>
          </h1>
          <p className="animate-rise mx-auto mt-6 max-w-xl text-lg text-muted-foreground" style={{ animationDelay: "240ms" }}>{s.subline}</p>
          <div className="animate-rise mt-10 flex flex-wrap justify-center gap-3" style={{ animationDelay: "360ms" }}>
            <Button asChild variant="hero" size="xl"><Link to="/book">Book a session <ArrowRight /></Link></Button>
            <Button asChild variant="glass" size="xl"><Link to="/portfolio">View portfolio</Link></Button>
          </div>
          <div className="animate-rise mt-3 flex justify-center" style={{ animationDelay: "420ms" }}>
            <EnquiryDialog />
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 h-12 w-px -translate-x-1/2 bg-gradient-to-b from-primary to-transparent" />
      </section>

      {/* Stats */}
      <section className="border-y border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {[["500+", "Sessions shot"], ["120+", "Weddings"], ["4.9★", "Client rating"], ["7 days", "Avg. delivery"]].map(([n, l]) => (
            <div key={l} className="border-border p-8 text-center md:border-r last:border-r-0">
              <p className="font-display text-5xl text-gold">{n}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured bento */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Selected work</p>
            <h2 className="mt-3 font-display text-5xl md:text-6xl">Frames that feel like <em>memory</em></h2>
          </div>
          <Button asChild variant="link"><Link to="/portfolio">See everything <ArrowRight /></Link></Button>
        </div>
        <div className="grid auto-rows-[220px] grid-cols-2 gap-3 md:grid-cols-4">
          {featured.map((it, i) => (
            <MediaTile key={it.id} item={it} onClick={() => setOpen(it)}
              className={i === 0 ? "col-span-2 row-span-2 h-full" : i === 3 ? "row-span-2 h-full" : "h-full"} />
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-5xl md:text-6xl">What we shoot</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { i: Heart, t: "Weddings", d: "From getting ready to the last dance, told like a film." },
              { i: Cake, t: "Birthdays", d: "Joyful, candid and colourful celebrations of every age." },
              { i: GraduationCap, t: "Graduations", d: "Mark the milestone with portraits you'll frame." },
              { i: Sparkles, t: "Anniversaries", d: "Intimate sessions for couples and families." },
              { i: Camera, t: "Portraits", d: "Personal branding, fashion and lifestyle shoots." },
              { i: Film, t: "Cinematic films", d: "Highlight reels and drone footage for big days." },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="group rounded-2xl border border-border p-8 transition hover:border-primary/50 hover:shadow-glow">
                <Icon className="h-7 w-7 text-primary transition group-hover:scale-110" />
                <h3 className="mt-6 font-display text-3xl">{t}</h3>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="overflow-hidden py-16">
        <div className="flex w-max gap-3 animate-marquee">
          {[...marquee, ...marquee].map((m, i) => (
            <img key={i} src={m.url} alt="" className="h-64 w-48 rounded-xl object-cover" loading="lazy" />
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <h2 className="text-center font-display text-5xl md:text-6xl">Simple, honest <em className="text-gold">pricing</em></h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PACKAGES.map((p) => (
            <div key={p.id} className={`rounded-2xl border p-8 ${"popular" in p ? "border-primary shadow-glow" : "border-border"}`}>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{p.name}</p>
              <p className="mt-3 font-display text-5xl">{ksh(p.price)}</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">{p.perks.slice(0, 3).map((x) => <li key={x}>— {x}</li>)}</ul>
              <Button asChild variant={"popular" in p ? "hero" : "glass"} className="mt-8 w-full" size="lg">
                <Link to="/book" search={{ pkg: p.id }}>Book {p.name}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-5xl md:text-6xl">Kind words</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border p-8">
                <div className="flex gap-1 text-primary">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <blockquote className="mt-5 font-display text-2xl italic leading-snug">“{t.text}”</blockquote>
                <figcaption className="mt-6 text-sm text-muted-foreground">{t.name} · {t.tag}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-32 text-center">
        <img src={s.hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-fade" />
        <div className="relative px-5">
          <h2 className="font-display text-5xl md:text-7xl">Your story, <em className="text-gold">beautifully told.</em></h2>
          <Button asChild variant="hero" size="xl" className="mt-10"><Link to="/book">Reserve your date</Link></Button>
        </div>
      </section>

      <Lightbox item={open} onClose={() => setOpen(null)} />
    </>
  );
}
