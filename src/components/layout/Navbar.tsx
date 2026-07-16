"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Menu, X, ChevronDown, ChevronRight, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string; name: string; slug: string;
  parent_id: string | null; sort_order: number;
}

const staticLinks = [
  { label: "Home",       href: "/" },
  { label: "About Us",   href: "/about" },
  { label: "Gallery",    href: "/gallery" },
  { label: "Promotions", href: "/promotions" },
  { label: "Contact",    href: "/contact" },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mobileExp,  setMobileExp]  = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    createClient().from("categories").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const parents = categories.filter(c => !c.parent_id);
  const kids    = (pid: string) => categories.filter(c => c.parent_id === pid);

  const navBg = scrolled || menuOpen || mobileOpen
    ? "bg-white shadow-sm py-3"
    : "bg-white/95 py-4";

  return (
    <>
      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => { setMenuOpen(false); setExpandedId(null); }} />}

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-wood-100 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" onClick={() => { setMenuOpen(false); setMobileOpen(false); }}>
            <Image src="/logo.png" alt="Kashant" width={160} height={56}
              className="h-12 w-auto object-contain" priority />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0">
            <Link href="/"
              className="px-4 py-2 text-sm text-wood-700 hover:text-wood-500 hover:bg-wood-50 transition-colors rounded">
              Home
            </Link>

            {/* Products */}
            <button onClick={() => { setMenuOpen(!menuOpen); setExpandedId(null); }}
              className={`flex items-center gap-1 px-4 py-2 text-sm transition-colors rounded ${menuOpen ? "text-wood-500 bg-wood-50" : "text-wood-700 hover:text-wood-500 hover:bg-wood-50"}`}>
              Products <ChevronDown size={13} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}/>
            </button>

            {staticLinks.slice(1).map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="px-4 py-2 text-sm text-wood-700 hover:text-wood-500 hover:bg-wood-50 transition-colors rounded">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="tel:+18326623909"
              className="flex items-center gap-2 text-sm font-medium text-wood-700 hover:text-wood-500 transition-colors">
              <Phone size={14}/> (832) 662-3909
            </a>
            <Link href="/products?category=pedicure-spa"
              className="px-5 py-2 bg-wood-500 text-white text-xs tracking-widest uppercase rounded hover:bg-wood-600 transition-colors">
              Get Quote
            </Link>
          </div>

          {/* Mobile */}
          <button onClick={() => { setMobileOpen(!mobileOpen); setMenuOpen(false); }}
            className="lg:hidden text-wood-700">
            {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>

        {/* Mega menu */}
        {menuOpen && (
          <div className="hidden lg:flex absolute top-full left-0 right-0 bg-white shadow-xl border-t border-wood-100 z-50">
            <div className="max-w-7xl mx-auto w-full flex">
              {/* Left */}
              <div className="w-72 border-r border-wood-100 py-4 max-h-[480px] overflow-y-auto">
                <Link href="/products" onClick={() => { setMenuOpen(false); }}
                  className="flex items-center justify-between px-6 py-3 text-sm font-semibold text-wood-800 hover:bg-wood-50 hover:text-wood-500 transition-colors">
                  All Products <ChevronRight size={14} className="opacity-30"/>
                </Link>
                <div className="h-px bg-wood-100 mx-6 my-1"/>
                {parents.map(parent => {
                  const children = kids(parent.id);
                  const isExp = expandedId === parent.id;
                  return (
                    <div key={parent.id}>
                      <div className={`flex items-center ${isExp ? "bg-wood-50" : "hover:bg-wood-50"} transition-colors`}>
                        <Link href={`/products?category=${parent.slug}`}
                          onClick={() => { setMenuOpen(false); setExpandedId(null); }}
                          className="flex-1 px-6 py-3 text-sm font-semibold text-wood-800 hover:text-wood-500 uppercase tracking-wide transition-colors">
                          {parent.name}
                        </Link>
                        {children.length > 0 && (
                          <button onClick={e => { e.stopPropagation(); setExpandedId(isExp ? null : parent.id); }}
                            className="px-4 py-3 text-wood-400 hover:text-wood-500">
                            <ChevronRight size={14} className={`transition-transform ${isExp ? "rotate-90" : ""}`}/>
                          </button>
                        )}
                      </div>
                      {isExp && (
                        <div className="bg-wood-50 border-l-2 border-gold-400 ml-6 mr-3 rounded-r mb-1">
                          {children.map(child => (
                            <Link key={child.id} href={`/products?category=${child.slug}`}
                              onClick={() => { setMenuOpen(false); setExpandedId(null); }}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-wood-600 hover:text-wood-500 hover:bg-white transition-colors rounded-r">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold-400/60 shrink-0"/>
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Right panel */}
              <div className="flex-1 p-10 bg-wood-50 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-widest text-wood-400 mb-2">Kashant C-Silan LLC</p>
                <h3 className="font-serif text-3xl font-bold text-wood-900 mb-3">Premium Nail Salon Furniture</h3>
                <p className="text-sm text-wood-600 leading-relaxed mb-8 max-w-sm">
                  From pedicure spa chairs to custom furniture — everything your salon needs, delivered nationwide.
                </p>
                <div className="flex gap-3">
                  <Link href="/products" onClick={() => setMenuOpen(false)}
                    className="px-6 py-3 bg-wood-500 text-white text-xs tracking-widest uppercase rounded hover:bg-wood-600 transition-colors">
                    View All Products
                  </Link>
                  <Link href="/promotions" onClick={() => setMenuOpen(false)}
                    className="px-6 py-3 border border-wood-300 text-wood-700 text-xs tracking-widest uppercase rounded hover:bg-wood-100 transition-colors">
                    Promotions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-wood-900 overflow-y-auto">
          <div className="pt-20 px-6 pb-10 space-y-1">
            <div className="relative mb-6">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && search.trim()) { window.location.href = `/products?q=${search}`; setMobileOpen(false); }}}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold-400"/>
            </div>
            <Link href="/" onClick={() => setMobileOpen(false)}
              className="block px-4 py-3.5 text-sm text-white/80 hover:text-gold-400 border-b border-white/10">Home</Link>
            <div className="border-b border-white/10">
              <button onClick={() => setMobileExp(mobileExp === "root" ? null : "root")}
                className="w-full flex items-center justify-between px-4 py-3.5 text-sm text-white/80 hover:text-gold-400">
                Products <ChevronDown size={15} className={`transition-transform ${mobileExp === "root" ? "rotate-180" : ""}`}/>
              </button>
              {mobileExp === "root" && (
                <div className="pb-3 pl-2 space-y-1">
                  <Link href="/products" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gold-400 font-medium">All Products</Link>
                  {parents.map(parent => {
                    const children = kids(parent.id);
                    const isExp = mobileExp === parent.id;
                    return (
                      <div key={parent.id}>
                        <div className="flex items-center">
                          <Link href={`/products?category=${parent.slug}`} onClick={() => setMobileOpen(false)}
                            className="flex-1 px-4 py-2.5 text-sm text-white/70 hover:text-gold-400">
                            {parent.name}
                          </Link>
                          {children.length > 0 && (
                            <button onClick={() => setMobileExp(isExp ? "root" : parent.id)}
                              className="px-4 py-2.5 text-white/30">
                              <ChevronRight size={13} className={`transition-transform ${isExp ? "rotate-90" : ""}`}/>
                            </button>
                          )}
                        </div>
                        {isExp && children.map(child => (
                          <Link key={child.id} href={`/products?category=${child.slug}`} onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 pl-8 pr-4 py-2 text-sm text-white/50 hover:text-gold-400">
                            <span className="w-1 h-1 rounded-full bg-gold-400/40"/>
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {staticLinks.slice(1).map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3.5 text-sm text-white/80 hover:text-gold-400 border-b border-white/10">
                {l.label}
              </Link>
            ))}
            <a href="tel:+18326623909" className="flex items-center gap-2 px-4 py-4 text-sm text-gold-400">
              <Phone size={15}/> (832) 662-3909
            </a>
          </div>
        </div>
      )}
    </>
  );
}