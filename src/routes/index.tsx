import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Phone, ShieldCheck, BadgeCheck, Truck, Star, Search, Clock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VehicleCard } from "@/components/VehicleCard";
import { BRAND, BODY_TYPES, SALE_TYPES, useSettings, useVehicles, waLink, ksh } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calzcars Autohub — Cars for cash, credit & imports on Kiambu Road" },
      {
        name: "description",
        content:
          "Calzcars Autohub sells clean cars for cash, offers hire-purchase credit plans, and imports vehicles to order. Visit us along Kiambu Road or book online.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Calzcars Autohub — Cash, Credit & Vehicle Imports" },
      {
        property: "og:description",
        content: "Clean inspected cars, honest credit plans and imports done for you — along Kiambu Road, Nairobi.",
      },
      { property: "og:image", content: "https://morganshotit.lovable.app/cars/hero.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://morganshotit.lovable.app/cars/hero.jpg" },
    ],
  }),
  component: Home,
});

const MAKES = ["Toyota", "Nissan", "Mazda", "Subaru", "Mitsubishi", "Isuzu", "Mercedes", "Land Rover", "Honda"];

const steps = [
  { icon: Search, title: "Pick your car", text: "Browse the showroom or tell us your budget and we shortlist for you." },
  { icon: Wallet, title: "Pay a deposit", text: "Send the deposit on M-Pesa and we hold the car under your name." },
  { icon: ShieldCheck, title: "We confirm", text: "We verify the payment and the paperwork, then lock the deal in writing." },
  { icon: BadgeCheck, title: "Drive out", text: "Collect the car with a full check report and a written warranty." },
];

const reviews = [
  { name: "Peter K.", tag: "Credit plan", text: "I paid KSh 120,000 deposit and have been paying monthly for a year. No surprises, no hidden charges." },
  { name: "Achieng' O.", tag: "Import", text: "They imported my Fielder from Japan and cleared it. I only went to the yard twice." },
  { name: "Daniel M.", tag: "Cash", text: "Bought a Prado cash. The car was exactly as posted and the transfer took two days." },
];

function Home() {
  const s = useSettings();
  const { vehicles } = useVehicles();
  const navigate = useNavigate();
  const [body, setBody] = useState<string>("all");
  const [sale, setSale] = useState<string>("all");
  const [max, setMax] = useState("");

  const featured = (vehicles.filter((v) => v.featured).length >= 3 ? vehicles.filter((v) => v.featured) : vehicles).slice(0, 6);
  const available = vehicles.filter((v) => v.status === "available").length;

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/stock",
      search: { body: body === "all" ? undefined : body, sale: sale === "all" ? undefined : sale, max: max ? Number(max) : undefined },
    });
  };

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] overflow-hidden grain">
        <img src={s.hero} alt="" className="absolute inset-0 h-full w-full object-cover animate-kenburns" />
        <div className="absolute inset-0 bg-fade" />
        <div className="absolute inset-0 bg-edge" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-5 pb-24 pt-32">
          <p className="eyebrow animate-rise text-primary">Along Kiambu Road · Nairobi</p>
          <h1 className="mt-4 max-w-3xl animate-rise text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
            {s.tagline.split(" ").slice(0, -2).join(" ")} <span className="text-gold">
              {s.tagline.split(" ").slice(-2).join(" ")}
            </span>
          </h1>
          <p className="mt-6 max-w-xl animate-rise text-lg text-muted-foreground">{s.subline}</p>

          <form onSubmit={search} className="mt-10 grid max-w-3xl animate-rise gap-3 rounded-2xl border border-border bg-background/70 p-3 backdrop-blur-xl sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Select value={sale} onValueChange={setSale}>
              <SelectTrigger className="border-0 bg-transparent"><SelectValue placeholder="Ways to buy" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any way to buy</SelectItem>
                {SALE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={body} onValueChange={setBody}>
              <SelectTrigger className="border-0 bg-transparent"><SelectValue placeholder="Body type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any body type</SelectItem>
                {BODY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              inputMode="numeric"
              value={max}
              onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
              placeholder="Max price (KSh)"
              className="border-0 bg-transparent"
            />
            <Button type="submit" variant="hero" size="lg" className="shrink-0">
              <Search className="h-4 w-4" /> Search
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild variant="hero" size="lg"><Link to="/stock">Browse showroom <ArrowRight /></Link></Button>
            <Button asChild variant="glass" size="lg"><a href={`tel:${BRAND.phoneRaw}`}><Phone className="h-4 w-4" /> {BRAND.phoneDisplay}</a></Button>
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              [`${available}+`, "Cars in stock"],
              ["Up to 48", "Month credit plan"],
              ["6–9 wks", "Import turnaround"],
              ["100%", "Verified paperwork"],
            ].map(([big, small]) => (
              <div key={small}>
                <p className="font-display text-3xl text-gold">{big}</p>
                <p className="text-xs text-muted-foreground">{small}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAKES MARQUEE */}
      <section className="overflow-hidden border-y border-border bg-card/50 py-5">
        <div className="flex w-max animate-marquee gap-14 pr-14">
          {[...MAKES, ...MAKES].map((m, i) => (
            <span key={i} className="whitespace-nowrap font-display text-xl tracking-tight text-muted-foreground/70">{m}</span>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">In the yard now</p>
            <h2 className="mt-2 text-4xl md:text-5xl">Featured stock</h2>
          </div>
          <Button asChild variant="glass"><Link to="/stock">See all cars <ArrowRight /></Link></Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((v) => <VehicleCard key={v.id} v={v} />)}
          {featured.length === 0 && (
            <p className="text-muted-foreground">Stock is being loaded — call {BRAND.phoneDisplay} and we'll tell you what just landed.</p>
          )}
        </div>
      </section>

      {/* THREE WAYS */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-24 md:grid-cols-3">
          {[
            { icon: BadgeCheck, title: "Cash cars", text: "Drive away the same day. Every car is inspected, serviced and the transfer is handled for you.", to: "/stock?sale=Cash" },
            { icon: Wallet, title: "Buy on credit", text: "Pay from 20% deposit and clear the balance in up to 48 months. Written terms, no hidden charges.", to: "/finance" },
            { icon: Truck, title: "Vehicle imports", text: "Tell us the model and budget. We source it, ship it, clear it at Mombasa and hand you the keys.", to: "/imports" },
          ].map(({ icon: Icon, title, text, to }) => (
            <Link key={title} to={to} className="group rounded-3xl border border-border bg-background/60 p-8 transition hover:border-primary/40 hover:shadow-glow">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-2xl">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm text-primary">
                Find out more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <p className="eyebrow text-primary">How it works</p>
        <h2 className="mt-2 max-w-2xl text-4xl md:text-5xl">From "I'm interested" to keys in hand</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="relative">
              <p className="font-display text-6xl text-primary/20">0{i + 1}</p>
              <Icon className="absolute left-0 top-3 h-5 w-5 text-primary" />
              <h3 className="mt-4 text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <p className="eyebrow text-primary">What customers say</p>
          <h2 className="mt-2 text-4xl md:text-5xl">People who already drove out</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="rounded-3xl border border-border bg-background/60 p-8">
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="mt-4 text-lg leading-relaxed">“{r.text}”</blockquote>
                <figcaption className="mt-6 text-sm text-muted-foreground">
                  <span className="text-foreground">{r.name}</span> · {r.tag}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl">Tell us your budget. We'll find the car.</h2>
              <p className="mt-4 text-muted-foreground">
                Send us the model you want and how much you can put down. We'll reply with real options the same day.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild variant="hero" size="lg">
                <a href={waLink(s.whatsapp, "Hello Calzcars Autohub, I'm looking for a car. My budget is ")}>
                  <Phone className="h-4 w-4" /> Chat on WhatsApp
                </a>
              </Button>
              <Button asChild variant="glass" size="lg"><Link to="/book"><Clock className="h-4 w-4" /> Book a car online</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
