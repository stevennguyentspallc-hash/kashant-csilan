"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, MessageSquare,
  LogOut, ExternalLink, Menu, X, Images, LayoutTemplate,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",      href: "/admin/dashboard" },
  { icon: Package,         label: "Products",       href: "/admin/products"  },
  { icon: LayoutTemplate,  label: "Banners",        href: "/admin/banners"   },
  { icon: Images,          label: "Gallery",        href: "/admin/gallery"   },
  { icon: MessageSquare,   label: "Quote Requests", href: "/admin/quotes"    },
];

export default function AdminSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <p className="font-serif text-xl font-bold text-white">KASHANT</p>
        <p className="text-[10px] tracking-widest2 text-gold-400 uppercase mt-0.5">Admin Panel</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                active
                  ? "bg-gold-400 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link href="/" target="_blank" onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all">
          <ExternalLink size={18} />
          View Website
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── DESKTOP sidebar (fixed left) ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-charcoal-900 flex-col z-40">
        <NavContent />
      </aside>

      {/* ── MOBILE top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-charcoal-900 flex items-center justify-between px-4 py-3 shadow-lg">
        <div>
          <p className="font-serif text-lg font-bold text-white leading-none">KASHANT</p>
          <p className="text-[9px] tracking-widest text-gold-400 uppercase">Admin Panel</p>
        </div>
        <button onClick={() => setOpen(!open)} className="text-white/70 hover:text-white p-1">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── MOBILE drawer ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          {/* drawer */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-charcoal-900 flex flex-col z-50">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
