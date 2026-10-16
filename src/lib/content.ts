import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BRAND = {
  name: "Calzcars Autohub",
  tag: "Cash. Credit. Imports.",
  phoneDisplay: "0742 064 560",
  phoneRaw: "0742064560",
  whatsapp: "254742064560",
  email: "csimiyu465@gmail.com",
  location: "Along Kiambu Road, Nairobi",
  hours: "Mon–Sat 8:30am – 6:00pm · Sunday by appointment",
} as const;

export const SALE_TYPES = ["Cash", "Credit", "Import"] as const;
export const BODY_TYPES = ["SUV", "Saloon", "Hatchback", "Crossover", "Pickup", "Van"] as const;
export const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;
export const TRANSMISSIONS = ["Automatic", "Manual", "CVT"] as const;
export const STATUSES = ["available", "reserved", "sold"] as const;

export type Vehicle = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  deposit: number;
  mileage_km: number;
  fuel: string;
  transmission: string;
  body_type: string;
  sale_type: string;
  status: string;
  description: string;
  images: string[];
  featured: boolean;
  created_at: string;
};

export const vehiclesQuery = {
  queryKey: ["vehicles"],
  queryFn: async (): Promise<Vehicle[]> => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Vehicle[];
  },
};

export function useVehicles() {
  const q = useQuery(vehiclesQuery);
  return { ...q, vehicles: q.data ?? [] };
}

export function useVehicle(id: string | undefined) {
  const { vehicles, ...rest } = useVehicles();
  return { ...rest, vehicle: vehicles.find((v) => v.id === id) ?? null };
}

export const settingsQuery = {
  queryKey: ["settings"],
  queryFn: async (): Promise<Record<string, string>> => {
    const { data } = await supabase.from("site_settings").select("key,value");
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  },
};

export function useSettings() {
  const q = useQuery(settingsQuery);
  const s = q.data ?? {};
  return {
    hero: s["hero_image"] || "/cars/hero.jpg",
    tagline: s["tagline"] || "Find the car you can actually afford.",
    subline:
      s["subline"] ||
      "Cash deals, credit plans you can budget for, and clean imports ordered for you — all from one yard on Kiambu Road.",
    whatsapp: s["whatsapp"] || BRAND.whatsapp,
    phone: s["phone"] || BRAND.phoneRaw,
    email: s["email"] || BRAND.email,
    location: s["location"] || BRAND.location,
    paybill: s["paybill"] || "400200",
    mpesaAccount: s["mpesa_account"] || BRAND.phoneRaw,
  };
}

export const ksh = (n: number) => `KSh ${Math.round(n || 0).toLocaleString("en-KE")}`;

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

export function monthlyPayment(price: number, deposit: number, months: number, ratePct = 13) {
  const principal = Math.max((price || 0) - (deposit || 0), 0);
  const months_ = Math.max(months || 0, 1);
  const r = ratePct / 100 / 12;
  if (principal <= 0) return 0;
  if (r <= 0) return principal / months_;
  return (principal * (r * Math.pow(1 + r, months_))) / (Math.pow(1 + r, months_) - 1);
}

export const waLink = (number: string, text: string) =>
  `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;

export async function uploadToStorage(file: File | Blob, name: string) {
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file, file.type ? { contentType: file.type } : {});
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage
    .from("media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 20);
  if (e2 || !data) throw e2 ?? new Error("Could not create link");
  return { path, url: data.signedUrl };
}

export const SPEC_ROWS: { key: keyof Vehicle; label: string; format?: (v: Vehicle) => string }[] = [
  { key: "year", label: "Year" },
  { key: "mileage_km", label: "Mileage", format: (v) => `${v.mileage_km.toLocaleString("en-KE")} km` },
  { key: "fuel", label: "Fuel" },
  { key: "transmission", label: "Transmission" },
  { key: "body_type", label: "Body" },
  { key: "sale_type", label: "Sale type" },
];
