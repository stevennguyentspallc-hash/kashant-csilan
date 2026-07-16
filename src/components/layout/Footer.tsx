import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

const productLinks = [
  { label: "Pedicure Spa",     href: "/products?category=pedicure-spa" },
  { label: "Furniture",        href: "/products?category=furniture" },
  { label: "Manicure Chair",   href: "/products?category=manicure-chair-main" },
  { label: "Head Spa",         href: "/products?category=head-spa" },
  { label: "Custom Furniture", href: "/products?category=custom-furniture" },
];

export default function Footer() {
  return (
    <footer className="bg-wood-900 text-white/70">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <Image src="/logo.png" alt="Kashant" width={140} height={48}
            className="h-12 w-auto object-contain mb-4 brightness-0 invert opacity-80" />
          <p className="text-sm leading-relaxed text-white/50 mt-3">
            Premium nail salon furniture crafted for discerning salon owners across the United States.
          </p>
        </div>

        {/* Products */}
        <div>
          <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Products</p>
          <ul className="space-y-2">
            {productLinks.map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-white/50 hover:text-gold-400 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Company</p>
          <ul className="space-y-2">
            {[
              { label: "Home",       href: "/" },
              { label: "About Us",   href: "/about" },
              { label: "Gallery",    href: "/gallery" },
              { label: "Promotions", href: "/promotions" },
              { label: "Contact",    href: "/contact" },
            ].map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-white/50 hover:text-gold-400 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Contact Us</p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={13} className="text-gold-400 shrink-0"/>
              <a href="tel:+18326623909" className="text-white/50 hover:text-gold-400 transition-colors">(832) 662-3909</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={13} className="text-gold-400 shrink-0"/>
              <a href="mailto:info@kashantcsilan.com" className="text-white/50 hover:text-gold-400 transition-colors">info@kashantcsilan.com</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={13} className="text-gold-400 shrink-0 mt-0.5"/>
              <span className="text-white/50">Serving nail salons nationwide across the United States</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-6 py-4 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-white/30">
        <p>© {new Date().getFullYear()} Kashant C-Silan LLC. All rights reserved.</p>
        <p>Designed for the US nail salon market.</p>
      </div>
    </footer>
  );
}