import { Play } from "lucide-react";
import type { MediaItem } from "@/lib/content";

export function MediaTile({ item, onClick, className = "" }: { item: MediaItem; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`group relative block w-full overflow-hidden rounded-2xl bg-muted ${className}`}>
      {item.kind === "video" ? (
        <>
          <video src={item.url} muted loop playsInline preload="metadata"
            onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass"><Play className="h-4 w-4" /></span>
        </>
      ) : (
        <img src={item.url} alt={item.title ?? item.category} loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-fade opacity-0 transition group-hover:opacity-100" />
      <div className="pointer-events-none absolute bottom-3 left-4 translate-y-2 text-left opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">{item.category}</p>
        {item.title && <p className="font-display text-xl">{item.title}</p>}
      </div>
    </button>
  );
}

export function Lightbox({ item, onClose }: { item: MediaItem | null; onClose: () => void }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-background/95 p-4 animate-in fade-in" onClick={onClose}>
      {item.kind === "video" ? (
        <video src={item.url} controls autoPlay className="max-h-[90vh] max-w-full rounded-xl" onClick={(e) => e.stopPropagation()} />
      ) : (
        <img src={item.url} alt={item.title ?? ""} className="max-h-[90vh] max-w-full rounded-xl object-contain" />
      )}
    </div>
  );
}
