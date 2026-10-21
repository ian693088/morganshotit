import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PACKAGES, PAYBILL, ksh } from "@/lib/content";

type Search = { pkg?: string | undefined };

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): Search => ({ pkg: typeof s["pkg"] === "string" ? s["pkg"] : undefined }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Book a Session — MorganShotIt Studio" },
      { name: "description", content: "Pick a package and date, pay via M-Pesa Paybill 714888, and confirm your booking." },
      { property: "og:title", content: "Book a Session — MorganShotIt Studio" },
      { property: "og:description", content: "Reserve your photography session in minutes." },
    ],
  }),
  component: Book,
});

function Book() {
  const { pkg } = Route.useSearch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>(pkg ?? "pro");
  const [form, setForm] = useState({ name: "", phone: "", date: "", notes: "", code: "" });
  const [busy, setBusy] = useState(false);
  const p = PACKAGES.find((x) => x.id === selected) ?? PACKAGES[1];
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id, full_name: form.name, phone: form.phone, package: p.name, amount: p.price,
      session_date: form.date, notes: form.notes || null, mpesa_code: form.code.trim().toUpperCase() || null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking received! We'll confirm once payment is verified.");
    navigate({ to: "/account" });
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-36">
      <p className="text-xs uppercase tracking-[0.3em] text-primary">Booking</p>
      <h1 className="mt-3 font-display text-6xl">Reserve your <em className="text-gold">date</em></h1>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="mb-3 text-sm text-muted-foreground">1. Choose a package</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {PACKAGES.map((x) => (
              <button key={x.id} type="button" onClick={() => setSelected(x.id)}
                className={`rounded-2xl border p-5 text-left transition ${selected === x.id ? "border-primary bg-card shadow-glow" : "border-border hover:border-primary/40"}`}>
                <p className="font-display text-2xl">{x.name}</p>
                <p className="text-primary">{ksh(x.price)}</p>
              </button>
            ))}
          </div>

          {!loading && !user ? (
            <div className="mt-10 rounded-2xl border border-border p-8 text-center">
              <p className="font-display text-3xl">Sign in to book</p>
              <p className="mt-2 text-muted-foreground">Create a free account so you can track your booking and payment.</p>
              <Button asChild variant="hero" size="lg" className="mt-6"><Link to="/auth">Sign in or sign up</Link></Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-10 space-y-5">
              <p className="text-sm text-muted-foreground">2. Your details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Full name</Label><Input required value={form.name} onChange={set("name")} /></div>
                <div className="space-y-2"><Label>Phone (M-Pesa)</Label><Input required placeholder="07XX XXX XXX" value={form.phone} onChange={set("phone")} /></div>
                <div className="space-y-2"><Label>Session date</Label><Input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={set("date")} /></div>
                <div className="space-y-2"><Label>M-Pesa confirmation code</Label><Input placeholder="e.g. SJK3XXXXXX" value={form.code} onChange={set("code")} /></div>
              </div>
              <div className="space-y-2"><Label>Notes (event type, location, ideas)</Label><Textarea rows={4} value={form.notes} onChange={set("notes")} /></div>
              <Button type="submit" variant="hero" size="xl" disabled={busy} className="w-full sm:w-auto">Confirm booking · {ksh(p.price)}</Button>
            </form>
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-primary/40 bg-card p-8 lg:sticky lg:top-28">
          <div className="flex items-center gap-3"><Smartphone className="text-primary" /><p className="font-display text-3xl">Pay with M-Pesa</p></div>
          <ol className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li>1. Open M-Pesa → Lipa na M-Pesa → <b className="text-foreground">Paybill</b></li>
            <li className="flex items-center justify-between">2. Business no. <button type="button" onClick={() => copy(PAYBILL.number)} className="flex items-center gap-2 font-display text-2xl text-primary">{PAYBILL.number}<Copy className="h-4 w-4" /></button></li>
            <li className="flex items-center justify-between">3. Account no. <button type="button" onClick={() => copy(PAYBILL.account)} className="flex items-center gap-2 font-display text-2xl text-primary">{PAYBILL.account}<Copy className="h-4 w-4" /></button></li>
            <li className="flex items-center justify-between">4. Amount <span className="font-display text-2xl text-foreground">{ksh(p.price)}</span></li>
            <li>5. Enter your PIN, then paste the confirmation code in the form.</li>
          </ol>
          <p className="mt-6 text-xs text-muted-foreground">Your booking is confirmed once we verify the payment.</p>
        </aside>
      </div>
    </div>
  );
}
