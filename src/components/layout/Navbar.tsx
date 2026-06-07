"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Menu, X, ChevronRight, ChevronDown, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

const navLinks = [
  { label: "Home",       href: "/" },
  { label: "About Us",   href: "/about" },
  { label: "Gallery",    href: "/gallery" },
  { label: "Promotions", href: "/promotions" },
  { label: "Contact",    href: "/contact" },
];

export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [productsOpen,  setProductsOpen]  = useState(false);
  const [expandedId,    setExpandedId]    = useState<string | null>(null);
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [mobileSearch,  setMobileSearch]  = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const parents  = categories.filter((c) => !c.parent_id);
  const children = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  const navBg = scrolled || productsOpen || mobileOpen
    ? "bg-white/95 backdrop-blur-sm shadow-sm py-3"
    : "bg-transparent py-5";

  const linkColor = scrolled || productsOpen || mobileOpen
    ? "text-charcoal-800"
    : "text-white";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" onClick={() => { setMobileOpen(false); setProductsOpen(false); }}>
            <Image src="/logo.png" alt="Kashant C-Silan LLC" width={160} height={56}
              className="h-14 w-auto object-contain drop-shadow" priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" ref={menuRef}>
            <Link href="/"
              className={`text-sm tracking-wider uppercase transition-colors hover:text-gold-400 ${linkColor}`}>
              Home
            </Link>

            {/* Products dropdown trigger */}
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className={`flex items-center gap-1 text-sm tracking-wider uppercase transition-colors hover:text-gold-400 ${linkColor}`}>
              Products
              <ChevronDown size={13} className={`transition-transform ${productsOpen ? "rotate-180" : ""}`} />
            </button>

            {navLinks.slice(1).map((link) => (
              <Link key={link.href} href={link.href}
                className={`text-sm tracking-wider uppercase transition-colors hover:text-gold-400 ${linkColor}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+18326623909"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-gold-400 ${linkColor}`}>
              <Phone size={15} /> (832) 662-3909
            </a>
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={() => setMobileSearch(!mobileSearch)}
              className={`transition-colors ${scrolled || mobileOpen ? "text-charcoal-900" : "text-white"}`}>
              <Search size={20} />
            </button>
            <button onClick={() => { setMobileOpen(!mobileOpen); setProductsOpen(false); }}
              className={`transition-colors ${scrolled || mobileOpen ? "text-charcoal-900" : "text-white"}`}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearch && (
          <div className="md:hidden px-6 pb-3 bg-white">
            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-800/40" />
              <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) { window.location.href = `/products?q=${searchQuery}`; }}}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-gold-400" />
            </div>
          </div>
        )}
      </header>

      {/* ── PRODUCTS MEGA MENU ─────────────────────────────── */}
      {productsOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProductsOpen(false)}>
          <div className="absolute top-[60px] left-0 right-0 bg-white shadow-2xl border-t border-cream-100"
            onClick={(e) => e.stopPropagation()}>
            <div className="max-w-7xl mx-auto flex">

              {/* Category list */}
              <div className="w-72 border-r border-cream-100 py-6">
                {/* All products */}
                <Link href="/products"
                  onClick={() => setProductsOpen(false)}
                  className="flex items-center justify-between px-6 py-3 text-sm font-semibold text-charcoal-900 hover:bg-cream-50 hover:text-gold-500 transition-colors">
                  All Products
                  <ChevronRight size={14} className="text-charcoal-800/30" />
                </Link>

                <div className="h-px bg-cream-100 mx-6 my-2" />

                {parents.map((parent) => {
                  const kids = children(parent.id);
                  const isExpanded = expandedId === parent.id;
                  return (
                    <div key={parent.id}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : parent.id)}
                        className="w-full flex items-center justify-between px-6 py-3 text-sm font-semibold text-charcoal-900 hover:bg-cream-50 hover:text-gold-500 transition-colors uppercase tracking-wide">
                        {parent.name}
                        {kids.length > 0
                          ? <ChevronRight size={14} className={`text-charcoal-800/30 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          : <ChevronRight size={14} className="text-charcoal-800/20" />
                        }
                      </button>

                      {/* Sub-items inline */}
                      {isExpanded && kids.length > 0 && (
                        <div className="bg-cream-50 border-l-2 border-gold-400 ml-6 mr-3 rounded-r-xl mb-1">
                          {kids.map((child) => (
                            <Link key={child.id}
                              href={`/products?category=${child.slug}`}
                              onClick={() => { setProductsOpen(false); setExpandedId(null); }}
                              className="flex items-center px-4 py-2.5 text-sm text-charcoal-800/70 hover:text-gold-500 hover:bg-white transition-colors rounded-r-xl">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold-400/50 mr-3 shrink-0" />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right panel — featured or info */}
              <div className="flex-1 p-8 bg-gradient-to-br from-cream-50 to-white">
                <p className="text-xs uppercase tracking-widest text-gold-400 mb-2">Kashant C-Silan LLC</p>
                <h3 className="font-serif text-2xl font-bold text-charcoal-900 mb-3">
                  Premium Nail Salon Furniture
                </h3>
                <p className="text-sm text-charcoal-800/60 leading-relaxed mb-6 max-w-sm">
                  From pedicure spa chairs to custom furniture — everything your salon needs, delivered nationwide.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  {[
                    { label: "Get Freight Quote", href: "/products", primary: true },
                    { label: "View Promotions",   href: "/promotions", primary: false },
                  ].map(({ label, href, primary }) => (
                    <Link key={href} href={href} onClick={() => setProductsOpen(false)}
                      className={`px-4 py-2.5 rounded-full text-xs tracking-widest uppercase text-center transition-colors ${
                        primary
                          ? "bg-charcoal-900 text-white hover:bg-gold-500"
                          : "border border-cream-200 text-charcoal-800 hover:border-gold-400"
                      }`}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE MENU ────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-charcoal-900 overflow-y-auto pt-20">
          <div className="px-6 py-4 space-y-1">
            {/* Search */}
            <div className="relative mb-4">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) { window.location.href = `/products?q=${searchQuery}`; setMobileOpen(false); }}}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold-400" />
            </div>

            <Link href="/" onClick={() => setMobileOpen(false)}
              className="block px-4 py-3.5 text-sm tracking-widest uppercase text-white/80 hover:text-gold-400 border-b border-white/10 transition-colors">
              Home
            </Link>

            {/* Products expandable */}
            <div className="border-b border-white/10">
              <button onClick={() => setExpandedId(expandedId === "mobile-products" ? null : "mobile-products")}
                className="w-full flex items-center justify-between px-4 py-3.5 text-sm tracking-widest uppercase text-white/80 hover:text-gold-400 transition-colors">
                Products
                <ChevronRight size={16} className={`transition-transform ${expandedId === "mobile-products" ? "rotate-90" : ""}`} />
              </button>

              {expandedId === "mobile-products" && (
                <div className="pb-3 space-y-1">
                  <Link href="/products" onClick={() => setMobileOpen(false)}
                    className="block px-6 py-2.5 text-sm text-gold-400 font-medium">
                    All Products
                  </Link>
                  {parents.map((parent) => {
                    const kids = children(parent.id);
                    return (
                      <div key={parent.id}>
                        <button onClick={() => setExpandedId(expandedId === parent.id ? "mobile-products" : parent.id)}
                          className="w-full flex items-center justify-between px-6 py-2.5 text-sm text-white/70 hover:text-gold-400 transition-colors uppercase tracking-wide">
                          {parent.name}
                          {kids.length > 0 && <ChevronDown size={13} className={`transition-transform ${expandedId === parent.id ? "rotate-180" : ""}`} />}
                        </button>
                        {expandedId === parent.id && kids.map((child) => (
                          <Link key={child.id} href={`/products?category=${child.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 pl-10 pr-6 py-2 text-sm text-white/50 hover:text-gold-400 transition-colors">
                            <span className="w-1 h-1 rounded-full bg-gold-400/40" />
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {navLinks.slice(1).map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3.5 text-sm tracking-widest uppercase text-white/80 hover:text-gold-400 border-b border-white/10 transition-colors">
                {link.label}
              </Link>
            ))}

            <a href="tel:+18326623909"
              className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-gold-400">
              <Phone size={15} /> (832) 662-3909
            </a>
          </div>
        </div>
      )}
    </>
  );
}
