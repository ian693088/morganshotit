import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Car, LayoutDashboard, LogOut, User, Phone, MapPin, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { BRAND, useSettings, waLink } from "@/lib/content";

const links = [
  { to: "/stock", label: "Showroom" },
  { to: "/finance", label: "Buy on credit" },
  { to: "/imports", label: "Imports" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, isApprover } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    qc.removeQueries({ queryKey: ["mine"] });
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 glass border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold text-primary-foreground">
            <Car className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Calzcars <span className="text-gold">Autohub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-muted-foreground transition hover:text-foreground"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              {(isAdmin || isApprover) && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">
                    <LayoutDashboard /> Dashboard
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link to="/account">
                  <User /> Account
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut />
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          <Button asChild variant="hero" size="sm" className="px-5">
            <Link to="/book">Book a car</Link>
          </Button>
        </div>

        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="font-display text-xl">Calzcars Autohub</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-5 pt-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="border-b border-border py-4 font-display text-3xl"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/stock" onClick={() => setOpen(false)} className="border-b border-border py-4 font-display text-3xl">
              Showroom
            </Link>
            {user ? (
              <>
                {(isAdmin || isApprover) && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="border-b border-border py-4 font-display text-3xl text-primary">
                    Dashboard
                  </Link>
                )}
                <Link to="/account" onClick={() => setOpen(false)} className="border-b border-border py-4 font-display text-3xl">
                  Account
                </Link>
                <button onClick={() => { setOpen(false); signOut(); }} className="py-4 text-left text-muted-foreground">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setOpen(false)} className="border-b border-border py-4 font-display text-3xl">
                  Sign in
                </Link>
                <Link to="/book" onClick={() => setOpen(false)} className="py-4 font-display text-3xl text-primary">
                  Book a car
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const s = useSettings();
  return (
    <footer className="relative mt-24 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="flex items-center gap-2 font-display text-2xl font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold text-primary-foreground">
              <Car className="h-4 w-4" />
            </span>
            Calzcars Autohub
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Cash sales, hire-purchase credit and vehicle imports from our yard along Kiambu Road. Every car
            is inspected, every plan is written down, and nothing moves until you are sure.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild variant="hero" size="sm">
              <a href={`tel:${BRAND.phoneRaw}`}>
                <Phone className="h-4 w-4" /> {BRAND.phoneDisplay}
              </a>
            </Button>
            <Button asChild variant="glass" size="sm">
              <a href={waLink(s.whatsapp, "Hello Calzcars Autohub, I would like to know more about your cars.")}>
                WhatsApp us
              </a>
            </Button>
          </div>
        </div>

        <div className="text-sm">
          <p className="mb-3 eyebrow text-primary">Explore</p>
          <div className="flex flex-col gap-2 text-muted-foreground">
            <Link to="/stock">Showroom</Link>
            <Link to="/finance">Buy on credit</Link>
            <Link to="/imports">Vehicle imports</Link>
            <Link to="/book">Book a car</Link>
            <Link to="/about">About us</Link>
          </div>
        </div>

        <div className="text-sm">
          <p className="mb-3 eyebrow text-primary">Visit the yard</p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {s.location}
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {BRAND.hours}
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a className="break-all" href={`mailto:${s.email}`}>{s.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Calzcars Autohub · Paybill {s.paybill} · Account {s.mpesaAccount}
      </div>
    </footer>
  );
}
