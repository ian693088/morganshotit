import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Star, Check, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, STARTER, ksh, mediaQuery, settingsQuery, uploadToStorage, useSettings } from "@/lib/content";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Dashboard — MorganShotIt Studio" },
      { name: "description", content: "Manage MorganShotIt photos, videos, bookings and team." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Dashboard — MorganShotIt Studio" },
      { property: "og:description", content: "Studio admin dashboard." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { user, isAdmin, isApprover, loading } = useAuth();
  if (loading) return <div className="pt-40 text-center text-muted-foreground">Loading…</div>;
  if (!user || (!isAdmin && !isApprover))
    return (
      <div className="grid min-h-[70vh] place-items-center pt-28 text-center">
        <div>
          <p className="font-display text-4xl">Admins only</p>
          <p className="mt-2 text-muted-foreground">This area is available once your admin access is approved.</p>
          <Button asChild variant="hero" className="mt-6" size="lg"><Link to={user ? "/account" : "/auth"}>{user ? "Request access" : "Sign in"}</Link></Button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32">
      <h1 className="font-display text-5xl">Studio dashboard</h1>
      <Tabs defaultValue={isAdmin ? "media" : "team"} className="mt-8">
        <TabsList>
          {isAdmin && <TabsTrigger value="media">Photos & videos</TabsTrigger>}
          {isAdmin && <TabsTrigger value="home">Homepage</TabsTrigger>}
          {isAdmin && <TabsTrigger value="bookings">Bookings</TabsTrigger>}
          {isAdmin && <TabsTrigger value="enquiries">Enquiries</TabsTrigger>}
          {isApprover && <TabsTrigger value="team">Team & approvals</TabsTrigger>}
        </TabsList>
        {isAdmin && <TabsContent value="media"><MediaManager /></TabsContent>}
        {isAdmin && <TabsContent value="home"><HomeSettings /></TabsContent>}
        {isAdmin && <TabsContent value="bookings"><Bookings /></TabsContent>}
        {isAdmin && <TabsContent value="enquiries"><Enquiries /></TabsContent>}
        {isApprover && <TabsContent value="team"><Team /></TabsContent>}
      </Tabs>
    </div>
  );
}

function MediaManager() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(mediaQuery);
  const [category, setCategory] = useState<string>("Weddings");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["media"] });

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) {
        const { path, url } = await uploadToStorage(f, f.name);
        const kind = f.type.startsWith("video") ? "video" : "image";
        const { error } = await supabase.from("media").insert({ url, storage_path: path, kind, category, title: title || null });
        if (error) throw error;
      }
      toast.success("Uploaded");
      setTitle("");
      refresh();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const importStarter = async () => {
    setBusy(true);
    try {
      for (const s of STARTER) {
        const blob = await (await fetch(s.url)).blob();
        const { path, url } = await uploadToStorage(new File([blob], "photo.jpg", { type: "image/jpeg" }), "photo.jpg");
        await supabase.from("media").insert({ url, storage_path: path, kind: "image", category: s.category, featured: s.featured });
      }
      toast.success("Your original photos are now managed here");
      refresh();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const remove = async (id: string, path: string | null) => {
    if (!confirm("Delete this item?")) return;
    if (path) await supabase.storage.from("media").remove([path]);
    await supabase.from("media").delete().eq("id", id);
    refresh();
  };
  const update = async (id: string, patch: { featured?: boolean; category?: string }) => {
    await supabase.from("media").update(patch).eq("id", id);
    refresh();
  };

  return (
    <div className="mt-6 space-y-8">
      <div className="rounded-2xl border border-border p-6">
        <div className="grid gap-4 md:grid-cols-[200px_1fr_auto] md:items-end">
          <div className="space-y-2"><Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Title (optional)</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <Button asChild variant="hero" size="lg" disabled={busy}>
            <label className="cursor-pointer"><Upload /> {busy ? "Uploading…" : "Upload photos / videos"}
              <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </label>
          </Button>
        </div>
        {data.length === 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted p-4 text-sm">
            <span>The site is currently showing your original photos. Import them to edit or delete them here.</span>
            <Button variant="glass" size="sm" onClick={importStarter} disabled={busy}><ImagePlus /> Import original photos</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {data.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            {m.kind === "video" ? <video src={m.url} muted className="aspect-square w-full object-cover" /> : <img src={m.url} alt="" className="aspect-square w-full object-cover" />}
            <div className="space-y-2 p-3">
              <Select value={m.category} onValueChange={(v) => update(m.id, { category: v })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex justify-between">
                <Button size="sm" variant={m.featured ? "default" : "ghost"} onClick={() => update(m.id, { featured: !m.featured })}><Star /> {m.featured ? "Featured" : "Feature"}</Button>
                <Button size="icon" variant="ghost" onClick={() => remove(m.id, m.storage_path ?? null)} aria-label="Delete"><Trash2 /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeSettings() {
  const qc = useQueryClient();
  const s = useSettings();
  const [form, setForm] = useState({ tagline: "", subline: "", whatsapp: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => { setForm({ tagline: s.tagline, subline: s.subline, whatsapp: s.whatsapp }); }, [s.tagline, s.subline, s.whatsapp]);

  const save = async (entries: Record<string, string>) => {
    const rows = Object.entries(entries).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("site_settings").upsert(rows);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: settingsQuery.queryKey });
  };
  const uploadHero = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      const { url } = await uploadToStorage(f, f.name);
      await save(f.type.startsWith("video") ? { hero_video: url } : { hero_image: url, hero_video: "" });
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <p className="font-display text-2xl">Main display</p>
        {s.heroVideo ? <video src={s.heroVideo} muted autoPlay loop className="aspect-video w-full rounded-2xl object-cover" /> : <img src={s.hero} alt="" className="aspect-video w-full rounded-2xl object-cover" />}
        <div className="flex gap-2">
          <Button asChild variant="hero" disabled={busy}>
            <label className="cursor-pointer"><Upload /> {busy ? "Uploading…" : "Change photo or video"}
              <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => uploadHero(e.target.files?.[0])} />
            </label>
          </Button>
          {s.heroVideo && <Button variant="glass" onClick={() => save({ hero_video: "" })}>Use photo instead</Button>}
        </div>
      </div>
      <div className="space-y-4">
        <p className="font-display text-2xl">Text & contact</p>
        <div className="space-y-2"><Label>Headline</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
        <div className="space-y-2"><Label>Sub-headline</Label><Input value={form.subline} onChange={(e) => setForm({ ...form, subline: e.target.value })} /></div>
        <div className="space-y-2"><Label>WhatsApp number (e.g. 2547XXXXXXXX)</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
        <Button variant="hero" onClick={() => save(form)}>Save</Button>
      </div>
    </div>
  );
}

function Bookings() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: async () => (await supabase.from("bookings").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const setStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
  };
  const total = data.filter((b) => b.status === "confirmed").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="mt-6 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[["Pending", data.filter((b) => b.status === "pending").length], ["Confirmed", data.filter((b) => b.status === "confirmed").length], ["Revenue", ksh(total)]].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-border p-5"><p className="text-sm text-muted-foreground">{l}</p><p className="font-display text-3xl">{v}</p></div>
        ))}
      </div>
      {data.map((b) => (
        <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-5">
          <div>
            <p className="font-display text-2xl">{b.full_name} · {b.package} · {ksh(b.amount)}</p>
            <p className="text-sm text-muted-foreground">{new Date(b.session_date).toDateString()} · {b.phone} · M-Pesa: <span className="text-primary">{b.mpesa_code ?? "—"}</span></p>
            {b.notes && <p className="mt-1 text-sm text-muted-foreground">“{b.notes}”</p>}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge s={b.status} />
            <Button size="sm" onClick={() => setStatus(b.id, "confirmed")}><Check /> Confirm</Button>
            <Button size="sm" variant="ghost" onClick={() => setStatus(b.id, "rejected")}><X /> Reject</Button>
          </div>
        </div>
      ))}
      {data.length === 0 && <p className="text-muted-foreground">No bookings yet.</p>}
    </div>
  );
}

function Enquiries() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: async () => (await supabase.from("inquiries").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const setStatus = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
  };
  return (
    <div className="mt-6 space-y-3">
      {data.map((q) => (
        <div key={q.id} className="rounded-2xl border border-border p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-2xl">{q.name}</p>
              <p className="text-sm text-muted-foreground">{q.email ?? "—"} · {q.phone} · {new Date(q.created_at).toLocaleString()}</p>
            </div>
            <StatusBadge s={q.status} />
          </div>
          <p className="mt-3 whitespace-pre-wrap">{q.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {q.email && (
              <Button size="sm" asChild onClick={() => setStatus(q.id, "replied")}>
                <a href={`mailto:${q.email}?subject=${encodeURIComponent("Re: Your enquiry — MorganShotIt Studio")}&body=${encodeURIComponent(`Hi ${q.name},\n\n\n\n— MorganShotIt Studio\n\nYour message:\n> ${q.message}`)}`}>Reply via email</a>
              </Button>
            )}
            {q.status !== "replied" && <Button size="sm" variant="ghost" onClick={() => setStatus(q.id, "replied")}><Check /> Mark replied</Button>}
          </div>
        </div>
      ))}
      {data.length === 0 && <p className="text-muted-foreground">No enquiries yet.</p>}
    </div>
  );
}

function Team() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: async () => {
      const [req, roles, profiles] = await Promise.all([
        supabase.from("admin_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("profiles").select("id, full_name, email"),
      ]);
      const byId = Object.fromEntries((profiles.data ?? []).map((p) => [p.id, p]));
      return { requests: req.data ?? [], roles: roles.data ?? [], byId };
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "team"] });
  const decide = async (id: string, approve: boolean) => {
    const { error } = await supabase.rpc("decide_admin_request", { _request_id: id, _approve: approve });
    if (error) { toast.error(error.message); return; }
    refresh();
  };
  const toggle = async (uid: string, role: "admin" | "approver", grant: boolean) => {
    const { error } = await supabase.rpc("set_user_role", { _user_id: uid, _role: role, _grant: grant });
    if (error) { toast.error(error.message); return; }
    refresh();
  };
  if (!data) return null;
  const members = Array.from(new Set(data.roles.map((r) => r.user_id)));
  const has = (uid: string, role: string) => data.roles.some((r) => r.user_id === uid && r.role === role);
  const label = (uid: string) => data.byId[uid]?.full_name || data.byId[uid]?.email || uid.slice(0, 8);

  return (
    <div className="mt-6 grid gap-10 md:grid-cols-2">
      <div>
        <p className="font-display text-2xl">Admin requests</p>
        <div className="mt-4 space-y-3">
          {data.requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between"><p>{label(r.user_id)}</p><StatusBadge s={r.status} /></div>
              {r.reason && <p className="mt-1 text-sm text-muted-foreground">{r.reason}</p>}
              {r.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => decide(r.id, true)}><Check /> Approve</Button>
                  <Button size="sm" variant="ghost" onClick={() => decide(r.id, false)}><X /> Reject</Button>
                </div>
              )}
            </div>
          ))}
          {data.requests.length === 0 && <p className="text-muted-foreground">No requests.</p>}
        </div>
      </div>
      <div>
        <p className="font-display text-2xl">Team members</p>
        <p className="text-sm text-muted-foreground">Approvers can approve new admins.</p>
        <div className="mt-4 space-y-3">
          {members.map((uid) => (
            <div key={uid} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border p-4">
              <p>{label(uid)}</p>
              <div className="flex gap-2">
                <Button size="sm" variant={has(uid, "admin") ? "default" : "ghost"} onClick={() => toggle(uid, "admin", !has(uid, "admin"))}>Admin</Button>
                <Button size="sm" variant={has(uid, "approver") ? "default" : "ghost"} onClick={() => toggle(uid, "approver", !has(uid, "approver"))}>Approver</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
