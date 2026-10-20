import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  message: z.string().trim().min(1, "Tell us what you're enquiring about").max(1000),
});

export function EnquiryDialog() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) { toast.error(r.error.issues[0]?.message ?? "Please check the form"); return; }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("inquiries").insert({ ...r.data, topic: "Enquiry", user_id: u.user?.id ?? null });
    setBusy(false);
    if (error) { toast.error("Couldn't send — please try again."); return; }
    toast.success("Enquiry sent! We'll reply to your email soon.");
    setF({ name: "", email: "", phone: "", message: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glass" size="xl"><MessageSquare /> Enquires</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Send an enquiry</DialogTitle>
          <DialogDescription>Ask us anything — we'll reply by email.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Name</Label><Input value={f.name} maxLength={100} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={f.email} maxLength={255} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input type="tel" value={f.phone} maxLength={20} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><Label>What are you enquiring about?</Label><Textarea rows={4} value={f.message} maxLength={1000} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>{busy ? "Sending…" : "Send"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
