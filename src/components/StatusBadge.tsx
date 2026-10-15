import { Badge } from "@/components/ui/badge";

export function StatusBadge({ s }: { s: string }) {
  const v = s === "confirmed" || s === "approved" ? "default" : s === "rejected" || s === "cancelled" ? "destructive" : "secondary";
  return <Badge variant={v} className="capitalize">{s}</Badge>;
}
