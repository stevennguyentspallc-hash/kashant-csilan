"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home",       href: "/" },
  { label: "Products",   href: "/products" },
  { label: "Promotions", href: "/promotions" },
  { label: "About Us",   href: "/about" },
  { label: "Gallery",    href: "/gallery" },
  { label: "Contact",    href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Kashant C-Silan LLC"
            width={180}
            height={60}
            className="h-16 w-auto object-contain drop-shadow"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wider uppercase transition-colors hover:text-gold-400 ${
                scrolled ? "text-charcoal-800" : "text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Phone CTA */}
        <a
          href="tel:+18326623909"
          className={`hidden md:flex items-center gap-2 text-sm font-medium transition-colors hover:text-gold-400 ${
            scrolled ? "text-charcoal-800" : "text-white"
          }`}
        >
          <Phone size={15} />
          (832) 662-3909
        </a>

        {/* Mobile menu button */}
        <button
          className={`md:hidden transition-colors ${scrolled ? "text-charcoal-900" : "text-white"}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-cream-200 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm tracking-wider uppercase text-charcoal-800 hover:text-gold-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+18326623909"
            className="flex items-center gap-2 text-sm font-medium text-gold-400"
          >
            <Phone size={15} /> (832) 662-3909
          </a>
        </div>
      )}
    </header>
  );
}
