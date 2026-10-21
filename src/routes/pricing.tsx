import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PACKAGES, PAYBILL, ksh } from "@/lib/content";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Pricing — MorganShotIt Studio" },
      { name: "description", content: "Basic KSh 3,500, Pro KSh 5,000, Cinematic KSh 10,000. Pay securely via M-Pesa Paybill." },
      { property: "og:title", content: "Pricing — MorganShotIt Studio" },
      { property: "og:description", content: "Photography packages from KSh 3,500." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36">
      <p className="text-center text-xs uppercase tracking-[0.3em] text-primary">Packages</p>
      <h1 className="mt-3 text-center font-display text-6xl md:text-7xl">Choose your <em className="text-gold">story</em></h1>
      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {PACKAGES.map((p) => {
          const pop = "popular" in p;
          return (
            <div key={p.id} className={`relative flex flex-col rounded-3xl border p-10 ${pop ? "border-primary bg-card shadow-glow" : "border-border"}`}>
              {pop && <span className="absolute -top-3 left-10 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary-foreground">Most loved</span>}
              <p className="font-display text-3xl">{p.name}</p>
              <p className="mt-4 font-display text-6xl">{ksh(p.price)}</p>
              <ul className="mt-8 flex-1 space-y-3">
                {p.perks.map((x) => <li key={x} className="flex gap-3 text-muted-foreground"><Check className="h-5 w-5 text-primary" />{x}</li>)}
              </ul>
              <Button asChild variant={pop ? "hero" : "glass"} size="lg" className="mt-10">
                <Link to="/book" search={{ pkg: p.id }}>Book {p.name}</Link>
              </Button>
            </div>
          );
        })}
      </div>
      <p className="mt-12 text-center text-muted-foreground">
        Pay via M-Pesa · Paybill <span className="text-primary">{PAYBILL.number}</span> · Account <span className="text-primary">{PAYBILL.account}</span>
      </p>
    </div>
  );
}
