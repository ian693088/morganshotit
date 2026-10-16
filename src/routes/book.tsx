import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Copy, Loader2, Lock, Phone, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BRAND, ksh, useSettings, useVehicles, waLink } from "@/lib/content";

type BookSearch = { car?: string };

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>): BookSearch => ({
    car: typeof search.car === "string" ? search.car : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Book a car — Calzcars Autohub" },
      {
        name: "description",
        content:
          "Reserve a car at Calzcars Autohub by paying the deposit on M-Pesa. We confirm your booking and hold the car for you.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Book a car — Calzcars Autohub" },
      { property: "og:description", content: "Pay a deposit, we confirm, the car is held for you." },
    ],
  }),
  component: Book,
});

function Book() {
  const { car } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { user, loading } = useAuth();
  const s = useSettings();
  const { vehicles } = useVehicles();
  const qc = useQueryClient();

  const [vehicleId, setVehicleId] = useState(car ?? "");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (car) setVehicleId(car);
  }, [car]);

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const deposit = vehicle?.deposit || (vehicle ? Math.round(vehicle.price * 0.2) : 0);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!vehicle) return toast.error("Pick a car first");
    setBusy(true);
    const { error } = await supabase.from("car_bookings").insert({
      vehicle_id: vehicle.id,
      user_id: user.id,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      deposit,
      mpesa_code: mpesaCode.trim().toUpperCase() || null,
      notes: notes.trim() || null,
      status: "pending",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["mine"] });
    setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-5 pb-24 pt-40 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-6 text-4xl">Booking received</h1>
        <p className="mt-4 text-muted-foreground">
          We're checking your {deposit ? `${ksh(deposit)} deposit ` : ""}
          {mpesaCode ? `and M-Pesa code ${mpesaCode.toUpperCase()} ` : ""}now. You'll get a call on {phone || BRAND.phoneDisplay} as
          soon as it's confirmed — usually within a few hours.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="hero"><Link to="/account">See my bookings</Link></Button>
          <Button asChild variant="glass"><Link to="/stock">Keep browsing</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32">
      <p className="eyebrow text-primary">Reserve it</p>
      <h1 className="mt-2 text-5xl">Book a car with a deposit</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Pick the car, send the deposit on M-Pesa, and tell us the confirmation code. We verify the payment and hold the car
        under your name — nothing is final until we confirm it.
      </p>

      {!loading && !user && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-primary/30 bg-primary/5 p-6">
          <div>
            <p className="font-display text-2xl">Sign in to book</p>
            <p className="mt-1 text-sm text-muted-foreground">Your booking is saved to your account so you can track its status.</p>
          </div>
          <Button asChild variant="hero" size="lg"><Link to="/auth">Sign in / Create account</Link></Button>
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="space-y-5 rounded-3xl border border-border bg-card p-6 md:p-8">
          <div>
            <label className="eyebrow text-muted-foreground">Which car</label>
            <Select value={vehicleId} onValueChange={(v) => { setVehicleId(v); navigate({ search: { car: v }, replace: true }); }}>
              <SelectTrigger className="mt-2"><SelectValue placeholder="Choose a car in stock" /></SelectTrigger>
              <SelectContent>
                {vehicles
                  .filter((v) => v.status !== "sold")
                  .map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.title} — {ksh(v.price)} {v.sale_type === "Credit" ? "(credit)" : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="eyebrow text-muted-foreground">Full name</label>
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Wanjiru" className="mt-2" />
            </div>
            <div>
              <label className="eyebrow text-muted-foreground">Phone</label>
              <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" className="mt-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="eyebrow text-muted-foreground">Email (optional)</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="mt-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="eyebrow text-muted-foreground">M-Pesa confirmation code</label>
              <Input
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                placeholder="e.g. SJK4HGLPQR"
                className="mt-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="eyebrow text-muted-foreground">Anything we should know?</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-2" placeholder="Preferred pickup day, trade-in, questions…" />
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy || !user}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {user ? "Send my booking" : "Sign in first"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            The deposit is refundable if we can't confirm the car as described.
          </p>
        </form>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6">
            <p className="flex items-center gap-2 font-display text-2xl"><Wallet className="h-5 w-5 text-primary" /> Pay the deposit</p>
            <p className="mt-2 text-sm text-muted-foreground">Lipa na M-Pesa, Paybill. Use your phone number as the account.</p>

            <div className="mt-6 space-y-3">
              {[
                ["Paybill number", s.paybill],
                ["Account number", vehicle ? `CALZ-${vehicle.id.slice(0, 6).toUpperCase()}` : s.mpesaAccount],
                ["Amount", deposit ? ksh(deposit) : "Pick a car to see the deposit"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-display text-lg">{value}</p>
                  </div>
                  {value && !value.startsWith("Pick") && (
                    <Button variant="ghost" size="icon" onClick={() => copy(String(value), label)} aria-label={`Copy ${label}`}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              Not sure about the paybill yet? Call {BRAND.phoneDisplay} or message us and we'll send the payment details
              and hold the car for 24 hours.
            </p>
            <Button asChild variant="glass" className="mt-4 w-full">
              <a href={waLink(s.whatsapp, `Hello Calzcars Autohub, I'd like to book the ${vehicle?.title ?? "car"} and need the payment details.`)}>
                <Phone className="h-4 w-4" /> Request payment details
              </a>
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-card/60 p-6 text-sm text-muted-foreground">
            <p className="mb-3 eyebrow text-primary">What happens next</p>
            <ol className="space-y-3">
              <li><span className="text-foreground">1.</span> We check the payment and the code you sent.</li>
              <li><span className="text-foreground">2.</span> The car is marked reserved under your name.</li>
              <li><span className="text-foreground">3.</span> We call you to fix a pickup or delivery time.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
