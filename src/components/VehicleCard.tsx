import { Link } from "@tanstack/react-router";
import { Gauge, Fuel, Cog, Calendar } from "lucide-react";
import { ksh, type Vehicle } from "@/lib/content";

const statusStyle: Record<string, string> = {
  available: "bg-success/15 text-success border-success/30",
  reserved: "bg-primary/15 text-primary border-primary/30",
  sold: "bg-destructive/15 text-destructive border-destructive/30",
};

export function VehicleCard({ v }: { v: Vehicle }) {
  const img = v.images[0] || "/cars/hero.jpg";
  return (
    <Link
      to="/vehicle/$id"
      params={{ id: v.id }}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
    >
      <div className="relative aspect-[3/2] overflow-hidden">
        <img
          src={img}
          alt={v.title}
          loading="lazy"
          width={1200}
          height={800}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full border border-primary/30 bg-background/80 px-3 py-1 eyebrow text-primary backdrop-blur">
            {v.sale_type}
          </span>
          {v.featured && (
            <span className="rounded-full border border-border bg-background/80 px-3 py-1 eyebrow backdrop-blur">
              Featured
            </span>
          )}
        </div>
        <span
          className={`absolute right-3 top-3 rounded-full border px-3 py-1 eyebrow backdrop-blur ${
            statusStyle[v.status] ?? statusStyle.available
          } bg-background/80`}
        >
          {v.status}
        </span>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-tight">{v.title}</h3>
          <p className="whitespace-nowrap font-display text-lg text-gold">{ksh(v.price)}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {v.year}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" /> {v.mileage_km.toLocaleString("en-KE")} km
          </span>
          <span className="inline-flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" /> {v.fuel}
          </span>
          <span className="inline-flex items-center gap-1">
            <Cog className="h-3.5 w-3.5" /> {v.transmission}
          </span>
        </div>
        {v.sale_type === "Credit" && v.deposit > 0 && (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            From <span className="text-foreground">{ksh(v.deposit)}</span> deposit
          </p>
        )}
      </div>
    </Link>
  );
}
