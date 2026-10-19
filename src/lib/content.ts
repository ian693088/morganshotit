import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import mainpic from "@/assets/gallery/mainpic1.jpg";
import pic2 from "@/assets/gallery/pic2.jpg";
import pic3 from "@/assets/gallery/pic3.jpg";
import pic4 from "@/assets/gallery/pic4.jpg";
import pic6 from "@/assets/gallery/pic6.jpg";
import pic7 from "@/assets/gallery/pic7.jpg";
import pic8 from "@/assets/gallery/pic8.jpg";
import pic9 from "@/assets/gallery/pic9.jpg";
import pic10 from "@/assets/gallery/pic10.jpg";
import pic18 from "@/assets/gallery/pic18.jpg";

export const CATEGORIES = ["Weddings", "Birthdays", "Graduations", "Anniversaries", "Portraits", "Others"] as const;

export const PACKAGES = [
  { id: "basic", name: "Basic", price: 3500, perks: ["1 hour session", "10 edited photos", "All raw photos included", "1 location", "Online gallery"] },
  { id: "pro", name: "Pro", price: 5000, perks: ["2 hour session", "15 edited photos", "All raw photos included", "2 locations", "Outfit change", "Priority delivery"], popular: true },
  { id: "cinematic", name: "Cinematic", price: 10000, perks: ["Half-day coverage", "25 edited photos", "All raw photos included", "Cinematic highlight film", "Drone shots", "Same-week delivery"] },
] as const;

export const PAYBILL = { number: "714888", account: "376949" };
export const WHATSAPP = "254700000000";

export type MediaItem = {
  id: string;
  kind: string;
  url: string;
  title: string | null;
  category: string;
  featured: boolean;
  storage_path?: string | null;
};

export const STARTER: MediaItem[] = [
  { src: pic2, c: "Weddings" }, { src: pic3, c: "Portraits" }, { src: pic4, c: "Birthdays" },
  { src: pic6, c: "Graduations" }, { src: pic7, c: "Anniversaries" }, { src: pic8, c: "Portraits" },
  { src: pic9, c: "Weddings" }, { src: pic10, c: "Others" }, { src: pic18, c: "Birthdays" },
].map((p, i) => ({ id: `starter-${i}`, kind: "image", url: p.src, title: null, category: p.c, featured: i < 6 }));

export const DEFAULT_HERO = mainpic;

export const mediaQuery = {
  queryKey: ["media"],
  queryFn: async (): Promise<MediaItem[]> => {
    const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const settingsQuery = {
  queryKey: ["settings"],
  queryFn: async (): Promise<Record<string, string>> => {
    const { data } = await supabase.from("site_settings").select("key,value");
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  },
};

export function useMedia() {
  const q = useQuery(mediaQuery);
  const items = q.data && q.data.length > 0 ? q.data : STARTER;
  return { ...q, items, usingStarter: !q.data || q.data.length === 0 };
}

export function useSettings() {
  const q = useQuery(settingsQuery);
  const s = q.data ?? {};
  return {
    hero: s["hero_image"] || DEFAULT_HERO,
    heroVideo: s["hero_video"] || "",
    tagline: s["tagline"] || "Capture Your Story",
    subline: s["subline"] || "Cinematic photography & film for the moments you'll want to relive forever.",
    whatsapp: s["whatsapp"] || WHATSAPP,
  };
}

export async function uploadToStorage(file: File | Blob, name: string) {
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file, file.type ? { contentType: file.type } : {});
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 20);
  if (e2 || !data) throw e2 ?? new Error("Could not create link");
  return { path, url: data.signedUrl };
}

export const ksh = (n: number) => `KSh ${n.toLocaleString("en-KE")}`;
