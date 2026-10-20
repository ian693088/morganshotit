import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LayoutDashboard, LogOut, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const links = [
  { to: "/", label: "Home" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/book", label: "Book" },
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
    <header className="fixed inset-x-0 top-0 z-50 bg-nav-violet md:glass border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Morgan Shot It" width={624} height={576} className="h-11 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-muted-foreground transition hover:text-foreground"
              activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {(isAdmin || isApprover) && (
                <Button asChild variant="ghost" size="sm"><Link to="/admin"><LayoutDashboard /> Dashboard</Link></Button>
              )}
              <Button asChild variant="ghost" size="sm"><Link to="/account"><User /> Account</Link></Button>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut /></Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
          )}
          <Button asChild variant="hero" size="sm" className="px-5"><Link to="/book">Book now</Link></Button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-nav-violet md:hidden animate-in fade-in">
          <div className="flex items-center justify-between px-5 py-4">
            <img src={logo} alt="Morgan Shot It" width={624} height={576} className="h-9 w-auto" />
            <button onClick={() => setOpen(false)} aria-label="Close menu"><X /></button>
          </div>
          <nav className="flex flex-col gap-1 px-5 pt-6">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="border-b border-border py-4 font-display text-3xl">
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                {(isAdmin || isApprover) && <Link to="/admin" onClick={() => setOpen(false)} className="border-b border-border py-4 font-display text-3xl text-primary">Dashboard</Link>}
                <Link to="/account" onClick={() => setOpen(false)} className="border-b border-border py-4 font-display text-3xl">Account</Link>
                <button onClick={() => { setOpen(false); signOut(); }} className="py-4 text-left text-muted-foreground">Sign out</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="py-4 font-display text-3xl">Sign in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-3xl">MorganShotIt</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">Photography & cinematic film studio. Weddings, birthdays, graduations and every story worth keeping.</p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2 text-foreground">Explore</p>
          <div className="flex flex-col gap-1">
            <Link to="/portfolio">Portfolio</Link><Link to="/pricing">Pricing</Link><Link to="/about">About</Link><Link to="/book">Book a session</Link>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2 text-foreground">Pay via M-Pesa</p>
          <p>Paybill <span className="text-primary">714888</span></p>
          <p>Account <span className="text-primary">376949</span></p>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} MorganShotIt Studio</p>
    </footer>
  );
}
