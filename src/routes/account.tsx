import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ksh } from "@/lib/content";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "My Account — MorganShotIt Studio" },
      { name: "description", content: "View your bookings and payment status." },
      { property: "og:title", content: "My Account — MorganShotIt Studio" },
      { property: "og:description", content: "Your MorganShotIt bookings." },
    ],
  }),
  component: Account,
});

function Account() {
  const { user, isAdmin, isApprover, loading } = useAuth();
  const qc = useQueryClient();
  const [reason, setReason] = useState("");

  const bookings = useQuery({
    queryKey: ["mine", "bookings", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("bookings").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });
  const request = useQuery({
    queryKey: ["mine", "request", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("admin_requests").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });

  if (loading) return <div className="pt-40 text-center text-muted-foreground">Loading…</div>;
  if (!user)
    return (
      <div className="grid min-h-[70vh] place-items-center pt-28 text-center">
        <div><p className="font-display text-4xl">Please sign in</p><Button asChild variant="hero" className="mt-6" size="lg"><Link to="/auth">Sign in</Link></Button></div>
      </div>
    );

  const askAdmin = async () => {
    const { error } = await supabase.from("admin_requests").insert({ user_id: user.id, reason: reason || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Request sent for approval");
    qc.invalidateQueries({ queryKey: ["mine", "request"] });
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36">
      <h1 className="font-display text-6xl">My account</h1>
      <p className="mt-2 text-muted-foreground">{user.email}</p>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">My bookings</h2>
          <Button asChild variant="hero" size="sm" className="px-5"><Link to="/book">New booking</Link></Button>
        </div>
        <div className="mt-6 space-y-3">
          {(bookings.data ?? []).map((b) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-5">
              <div>
                <p className="font-display text-2xl">{b.package} · {ksh(b.amount)}</p>
                <p className="text-sm text-muted-foreground">{new Date(b.session_date).toDateString()} · M-Pesa: {b.mpesa_code ?? "not provided"}</p>
              </div>
              <StatusBadge s={b.status} />
            </div>
          ))}
          {bookings.data?.length === 0 && <p className="text-muted-foreground">No bookings yet.</p>}
        </div>
      </section>

      {!isAdmin && (
        <section className="mt-16 rounded-2xl border border-border p-8">
          <h2 className="font-display text-3xl">Studio team access</h2>
          {request.data ? (
            <p className="mt-3 text-muted-foreground">Your admin request is <StatusBadge s={request.data.status} /></p>
          ) : (
            <>
              <p className="mt-2 text-muted-foreground">Part of the MorganShotIt team? Request admin access — it must be approved before you can manage the site.</p>
              <Textarea className="mt-4" placeholder="Who are you? (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
              <Button variant="glass" className="mt-4" onClick={askAdmin}>Request admin access</Button>
            </>
          )}
        </section>
      )}
      {(isAdmin || isApprover) && (
        <Button asChild variant="hero" size="lg" className="mt-12"><Link to="/admin">Open dashboard</Link></Button>
      )}
    </div>
  );
}
