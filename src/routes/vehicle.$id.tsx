import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Phone, ShieldCheck, Gauge, Fuel, Cog, Calendar, Car, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VehicleCard } from "@/components/VehicleCard";
import { BRAND, ksh, monthlyPayment, useSettings, useVehicles, waLink } from "@/lib/content";

export const Route = createFileRoute("/vehicle/$id")({
  head: ({ params }: { params: { id: string } }) => ({
    meta: [
      { title: "Car detail — Calzcars Autohub" },
      { name: "description", content: "Full specs, photos, price and deposit for this car at Calzcars Autohub." },
      { property: "og:type", content: "product" },
      { property: "og:title", content: "Car detail — Calzcars Autohub" },
      { property: "og:description", content: "Clean inspected car available for cash or credit at Calzcars Autohub, Kiambu Road." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index, follow" },
      { id: "car-id", content: params.id },
    ],
  }),
  component: VehiclePage,
});

const TERMS = [48, 36, 24, 12];

function VehiclePage() {
  const { id } = Route.useParams();
  const { vehicles, isLoading } = useVehicles();
  const s = useSettings();
  const [active, setActive] = useState(0);
  const [months, setMonths] = useState(36);

  const v = vehicles.find((x) => x.id === id);
  if (!v) {
    if (isLoading) return <div className="pt-40 text-center text-muted-foreground">Loading car…</div>;
    throw notFound();
  }

  const images = v.images.length ? v.images : ["/cars/hero.jpg"];
  const deposit = v.deposit || Math.round(v.price * 0.2);
  const monthly = monthlyPayment(v.price, deposit, months);
  const similar = vehicles.filter((x) => x.id !== v.id && (x.body_type === v.body_type || x.sale_type === v.sale_type)).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">
      <Link to="/stock" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to showroom
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-border">
            <img src={images[active]} alt={v.title} className="aspect-[3/2] w-full object-cover" />
            <div className="absolute left-4 top-4 flex gap-2">
              <Badge className="border-primary/30 bg-background/80 text-primary">{v.sale_type}</Badge>
              <Badge className="border-border bg-background/80 capitalize">{v.status}</Badge>
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  className={`h-20 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    i === active ? "border-primary" : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-3xl">About this car</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {v.description ||
                "Fresh from the yard at Kiambu Road. Serviced, inspected and ready for a test drive. Ask us for the full check report."}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                [Calendar, "Year", String(v.year)],
                [Gauge, "Mileage", `${v.mileage_km.toLocaleString("en-KE")} km`],
                [Fuel, "Fuel", v.fuel],
                [Cog, "Gearbox", v.transmission],
                [Car, "Body", v.body_type],
                [ShieldCheck, "Sale type", v.sale_type],
              ].map(([Icon, label, value]) => (
                <div key={label as string} className="rounded-2xl border border-border bg-card/60 p-4">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="mt-3 text-xs text-muted-foreground">{label as string}</p>
                  <p className="font-display text-lg">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="eyebrow text-primary">{v.make} {v.model}</p>
            <h1 className="mt-2 text-3xl">{v.title}</h1>
            <p className="mt-4 font-display text-4xl text-gold">{ksh(v.price)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Deposit <span className="text-foreground">{ksh(deposit)}</span> · balance on {months} months
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4">
              <p className="eyebrow text-primary">Estimate your monthly</p>
              <div className="mt-3 flex gap-2">
                {TERMS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setMonths(t)}
                    className={`flex-1 rounded-lg border px-2 py-2 text-xs transition ${
                      t === months ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {t} mo
                  </button>
                ))}
              </div>
              <p className="mt-4 font-display text-3xl">{ksh(monthly)}<span className="text-sm text-muted-foreground"> / month</span></p>
              <p className="mt-1 text-xs text-muted-foreground">
                Indicative only, at 13% reducing balance over {months} months. We confirm the real figure in writing.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button asChild variant="hero" size="lg" disabled={v.status === "sold"}>
                <Link to="/book" search={{ car: v.id }}>
                  {v.status === "sold" ? "Already sold" : "Book with a deposit"}
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <a href={waLink(s.whatsapp, `Hello Calzcars Autohub, I'm interested in the ${v.title} (${v.year}) listed at ${ksh(v.price)}. Is it still available?`)}>
                  Ask about this car
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href={`tel:${BRAND.phoneRaw}`}><Phone className="h-4 w-4" /> {BRAND.phoneDisplay}</a>
              </Button>
            </div>
          </div>

          <ul className="space-y-2 rounded-3xl border border-border bg-card/60 p-6 text-sm">
            {[
              "Inspected and serviced before delivery",
              "Written agreement, no hidden charges",
              "Transfer and plate work handled by us",
              "Test drive before you commit",
            ].map((t) => (
              <li key={t} className="flex gap-2 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-24">
          <h2 className="text-3xl">You may also like</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((x) => <VehicleCard key={x.id} v={x} />)}
          </div>
        </section>
      )}
    </div>
  );
}
