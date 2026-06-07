"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Phone, Menu, X, ChevronRight, ChevronDown, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string; name: string; slug: string;
  parent_id: string | null; sort_order: number;
}

const navLinks = [
  { label: "Home",       href: "/" },
  { label: "About Us",   href: "/about" },
  { label: "Gallery",    href: "/gallery" },
  { label: "Promotions", href: "/promotions" },
  { label: "Contact",    href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [mobileCatId,  setMobileCatId]  = useState<string | null>(null);
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [search,       setSearch]       = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    createClient().from("categories").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setExpandedId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const parents  = categories.filter(c => !c.parent_id);
  const kids     = (pid: string) => categories.filter(c => c.parent_id === pid);

  const isDark   = !scrolled && !menuOpen && !mobileOpen;
  const textCls  = isDark ? "text-white" : "text-charcoal-800";
  const headerBg = scrolled || menuOpen || mobileOpen
    ? "bg-white/95 backdrop-blur-sm shadow-sm py-3"
    : "bg-transparent py-5";

  const goTo = (href: string) => {
    setMenuOpen(false);
    setExpandedId(null);
    setMobileOpen(false);
    router.push(href);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" ref={menuRef}>
          {/* Logo */}
          <button onClick={() => goTo("/")} className="flex items-center">
            <Image src="/logo.png" alt="Kashant" width={160} height={56}
              className="h-14 w-auto object-contain drop-shadow" priority/>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => goTo("/")}
              className={`text-sm tracking-wider uppercase transition-colors hover:text-gold-400 ${textCls}`}>
              Home
            </button>

            {/* Products button */}
            <div className="relative">
              <button
                onClick={() => { setMenuOpen(!menuOpen); setExpandedId(null); }}
                className={`flex items-center gap-1 text-sm tracking-wider uppercase transition-colors hover:text-gold-400 ${textCls}`}>
                Products
                <ChevronDown size={13} className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}/>
              </button>
            </div>

            {navLinks.slice(1).map(link => (
              <button key={link.href} onClick={() => goTo(link.href)}
                className={`text-sm tracking-wider uppercase transition-colors hover:text-gold-400 ${textCls}`}>
                {link.label}
              </button>
            ))}
          </nav>

          {/* Phone */}
          <a href="tel:+18326623909"
            className={`hidden md:flex items-center gap-2 text-sm font-medium transition-colors hover:text-gold-400 ${textCls}`}>
            <Phone size={15}/> (832) 662-3909
          </a>

          {/* Mobile toggle */}
          <button onClick={() => { setMobileOpen(!mobileOpen); setMenuOpen(false); }}
            className={`md:hidden transition-colors ${isDark ? "text-white" : "text-charcoal-900"}`}>
            {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>

        {/* ── MEGA MENU ─────────────────────────────────────────── */}
        {menuOpen && (
          <div className="hidden md:block absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-cream-100 z-50">
            <div className="max-w-7xl mx-auto flex min-h-[300px]">
              {/* Left: category list */}
              <div className="w-72 border-r border-cream-100 py-4 overflow-y-auto max-h-[500px]">
                <button onClick={() => goTo("/products")}
                  className="w-full flex items-center justify-between px-6 py-3 text-sm font-semibold text-charcoal-900 hover:bg-cream-50 hover:text-gold-500 transition-colors">
                  All Products
                  <ChevronRight size={14} className="text-charcoal-800/20"/>
                </button>
                <div className="h-px bg-cream-100 mx-6 my-1"/>

                {parents.map(parent => {
                  const children = kids(parent.id);
                  const isExp = expandedId === parent.id;
                  return (
                    <div key={parent.id}>
                      <div className={`flex items-center ${isExp ? "bg-cream-50" : "hover:bg-cream-50"} transition-colors`}>
                        <button
                          onClick={() => goTo(`/products?category=${parent.slug}`)}
                          className="flex-1 text-left px-6 py-3 text-sm font-semibold text-charcoal-900 hover:text-gold-500 uppercase tracking-wide transition-colors">
                          {parent.name}
                        </button>
                        {children.length > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedId(isExp ? null : parent.id); }}
                            className="px-3 py-3 text-charcoal-800/30 hover:text-gold-400 transition-colors">
                            <ChevronRight size={14} className={`transition-transform duration-200 ${isExp ? "rotate-90" : ""}`}/>
                          </button>
                        )}
                      </div>

                      {isExp && children.length > 0 && (
                        <div className="bg-cream-50 border-l-2 border-gold-400 ml-6 mr-3 rounded-r-xl mb-1">
                          {children.map(child => (
                            <button key={child.id}
                              onClick={() => goTo(`/products?category=${child.slug}`)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-800/70 hover:text-gold-500 hover:bg-white transition-colors rounded-r-xl">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold-400/50 shrink-0"/>
                              {child.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right: promo panel */}
              <div className="flex-1 p-10 bg-gradient-to-br from-cream-50 to-white flex flex-col justify-center">
                <p className="text-xs uppercase tracking-widest text-gold-400 mb-2">Kashant C-Silan LLC</p>
                <h3 className="font-serif text-3xl font-bold text-charcoal-900 mb-3">Premium Nail Salon Furniture</h3>
                <p className="text-sm text-charcoal-800/60 leading-relaxed mb-8 max-w-sm">
                  From pedicure spa chairs to custom furniture — everything your salon needs, delivered nationwide.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => goTo("/products")}
                    className="px-6 py-3 bg-charcoal-900 text-white text-xs tracking-widest uppercase rounded-full hover:bg-gold-500 transition-colors">
                    View All Products
                  </button>
                  <button onClick={() => goTo("/promotions")}
                    className="px-6 py-3 border border-cream-200 text-charcoal-800 text-xs tracking-widest uppercase rounded-full hover:border-gold-400 transition-colors">
                    Promotions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── MOBILE MENU ───────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-charcoal-900 overflow-y-auto">
          <div className="pt-20 px-6 pb-8 space-y-1">
            {/* Search */}
            <div className="relative mb-6">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && search.trim()) goTo(`/products?q=${search}`); }}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold-400"/>
            </div>

            <button onClick={() => goTo("/")}
              className="w-full text-left px-4 py-3.5 text-sm tracking-widest uppercase text-white/80 hover:text-gold-400 border-b border-white/10 transition-colors">
              Home
            </button>

            {/* Products */}
            <div className="border-b border-white/10">
              <button onClick={() => setMobileCatId(mobileCatId === "products" ? null : "products")}
                className="w-full flex items-center justify-between px-4 py-3.5 text-sm tracking-widest uppercase text-white/80 hover:text-gold-400 transition-colors">
                Products
                <ChevronDown size={15} className={`transition-transform ${mobileCatId === "products" ? "rotate-180" : ""}`}/>
              </button>
              {mobileCatId === "products" && (
                <div className="pb-3 pl-4 space-y-1">
                  <button onClick={() => goTo("/products")}
                    className="w-full text-left px-4 py-2.5 text-sm text-gold-400 font-medium">
                    All Products
                  </button>
                  {parents.map(parent => {
                    const children = kids(parent.id);
                    return (
                      <div key={parent.id}>
                        <button onClick={() => setMobileCatId(mobileCatId === parent.id ? "products" : parent.id)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm uppercase tracking-wide text-white/70 hover:text-gold-400 transition-colors">
                          {parent.name}
                          {children.length > 0 && (
                            <ChevronDown size={13} className={`transition-transform ${mobileCatId === parent.id ? "rotate-180" : ""}`}/>
                          )}
                        </button>
                        {mobileCatId === parent.id && children.map(child => (
                          <button key={child.id} onClick={() => goTo(`/products?category=${child.slug}`)}
                            className="w-full flex items-center gap-2 pl-8 pr-4 py-2 text-sm text-white/50 hover:text-gold-400 transition-colors">
                            <span className="w-1 h-1 rounded-full bg-gold-400/40"/>
                            {child.name}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {navLinks.slice(1).map(link => (
              <button key={link.href} onClick={() => goTo(link.href)}
                className="w-full text-left px-4 py-3.5 text-sm tracking-widest uppercase text-white/80 hover:text-gold-400 border-b border-white/10 transition-colors">
                {link.label}
              </button>
            ))}

            <a href="tel:+18326623909" className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-gold-400">
              <Phone size={15}/> (832) 662-3909
            </a>
          </div>
        </div>
      )}
    </>
  );
}