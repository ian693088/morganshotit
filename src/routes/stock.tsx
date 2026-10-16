import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VehicleCard } from "@/components/VehicleCard";
import { BODY_TYPES, BRAND, FUELS, SALE_TYPES, TRANSMISSIONS, ksh, useVehicles } from "@/lib/content";

type StockSearch = {
  q?: string;
  sale?: string;
  body?: string;
  make?: string;
  fuel?: string;
  transmission?: string;
  min?: number;
  max?: number;
  sort?: "new" | "cheap" | "expensive";
};

export const Route = createFileRoute("/stock")({
  validateSearch: (search: Record<string, unknown>): StockSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    sale: typeof search.sale === "string" ? search.sale : undefined,
    body: typeof search.body === "string" ? search.body : undefined,
    make: typeof search.make === "string" ? search.make : undefined,
    fuel: typeof search.fuel === "string" ? search.fuel : undefined,
    transmission: typeof search.transmission === "string" ? search.transmission : undefined,
    min: typeof search.min === "string" || typeof search.min === "number" ? Number(search.min) || undefined : undefined,
    max: typeof search.max === "string" || typeof search.max === "number" ? Number(search.max) || undefined : undefined,
    sort: search.sort === "new" || search.sort === "cheap" || search.sort === "expensive" ? search.sort : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Showroom — Calzcars Autohub" },
      {
        name: "description",
        content:
          "Browse cars for cash, credit and import at Calzcars Autohub. Filter by body type, make, fuel, transmission and budget.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Showroom — Calzcars Autohub" },
      { property: "og:description", content: "Clean inspected cars for cash, credit and import along Kiambu Road." },
    ],
  }),
  component: Stock,
});

function Stock() {
  const s = Route.useSearch();
  const { vehicles, isLoading } = useVehicles();
  const [showFilters, setShowFilters] = useState(false);

  const makes = useMemo(() => Array.from(new Set(vehicles.map((v) => v.make).filter(Boolean))).sort(), [vehicles]);

  const results = useMemo(() => {
    let out = vehicles.filter((v) => {
      if (s.sale && v.sale_type !== s.sale) return false;
      if (s.body && v.body_type !== s.body) return false;
      if (s.make && v.make !== s.make) return false;
      if (s.fuel && v.fuel !== s.fuel) return false;
      if (s.transmission && v.transmission !== s.transmission) return false;
      if (s.min && v.price < s.min) return false;
      if (s.max && v.price > s.max) return false;
      if (s.q) {
        const hay = `${v.title} ${v.make} ${v.model} ${v.year} ${v.body_type}`.toLowerCase();
        if (!hay.includes(s.q.toLowerCase())) return false;
      }
      return true;
    });
    if (s.sort === "cheap") out = [...out].sort((a, b) => a.price - b.price);
    else if (s.sort === "expensive") out = [...out].sort((a, b) => b.price - a.price);
    else out = [...out].sort((a, b) => Number(b.featured) - Number(a.featured) || +new Date(b.created_at) - +new Date(a.created_at));
    return out;
  }, [vehicles, s]);

  const active = [s.sale, s.body, s.make, s.fuel, s.transmission, s.min && `min ${ksh(s.min)}`, s.max && `max ${ksh(s.max)}`].filter(
    Boolean,
  ).length;

  const navigate = Route.useNavigate();
  const set = (patch: Partial<StockSearch>) => {
    const next: StockSearch = { ...s, ...patch };
    (Object.keys(next) as (keyof StockSearch)[]).forEach((k) => {
      const value = next[k];
      if (value === undefined || value === "" || (typeof value === "number" && Number.isNaN(value))) delete next[k];
    });
    navigate({ search: next, replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">The showroom</p>
          <h1 className="mt-2 text-5xl">Every car in the yard</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {isLoading ? "Loading stock…" : `${results.length} ${results.length === 1 ? "car" : "cars"} matching you right now.`}
          </p>
        </div>
        <Button variant="glass" onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters {active > 0 && `(${active})`}
        </Button>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-card/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            defaultValue={s.q ?? ""}
            onChange={(e) => set({ q: e.target.value || undefined })}
            placeholder="Search a model, make or year…"
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={s.sale ?? "all"} onValueChange={(v) => set({ sale: v === "all" ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="Ways to buy" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any way to buy</SelectItem>
            {SALE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={s.sort ?? "new"} onValueChange={(v) => set({ sort: v as StockSearch["sort"] })}>
          <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Newest & featured</SelectItem>
            <SelectItem value="cheap">Price: low to high</SelectItem>
            <SelectItem value="expensive">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-card/60 p-4 sm:grid-cols-2 lg:grid-cols-6">
          <Select value={s.body ?? "all"} onValueChange={(v) => set({ body: v === "all" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="Body" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any body</SelectItem>
              {BODY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={s.make ?? "all"} onValueChange={(v) => set({ make: v === "all" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="Make" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any make</SelectItem>
              {makes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={s.fuel ?? "all"} onValueChange={(v) => set({ fuel: v === "all" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="Fuel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any fuel</SelectItem>
              {FUELS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={s.transmission ?? "all"} onValueChange={(v) => set({ transmission: v === "all" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="Gearbox" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any gearbox</SelectItem>
              {TRANSMISSIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            inputMode="numeric"
            defaultValue={s.min ?? ""}
            onChange={(e) => set({ min: Number(e.target.value.replace(/\D/g, "")) || undefined })}
            placeholder="Min price"
          />
          <Input
            inputMode="numeric"
            defaultValue={s.max ?? ""}
            onChange={(e) => set({ max: Number(e.target.value.replace(/\D/g, "")) || undefined })}
            placeholder="Max price"
          />
          {active > 0 && (
            <Button variant="ghost" className="lg:col-span-6" onClick={() => set({ body: undefined, make: undefined, fuel: undefined, transmission: undefined, min: undefined, max: undefined })}>
              <X className="h-4 w-4" /> Clear extra filters
            </Button>
          )}
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((v) => <VehicleCard key={v.id} v={v} />)}
      </div>

      {!isLoading && results.length === 0 && (
        <div className="mt-16 rounded-3xl border border-border bg-card/60 p-10 text-center">
          <p className="font-display text-3xl">No car matches those filters yet</p>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            New stock lands every week, and we import to order. Tell us what you're after and we'll source it.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero"><a href={`tel:${BRAND.phoneRaw}`}>Call {BRAND.phoneDisplay}</a></Button>
            <Button asChild variant="glass"><Link to="/imports">Order an import</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
