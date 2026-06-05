import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-white/70">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <p className="font-serif text-2xl text-white font-bold">KASHANT</p>
          <p className="text-xs tracking-widest2 text-gold-400 uppercase mt-1 mb-4">
            C-Silan LLC
          </p>
          <p className="text-sm leading-relaxed">
            Premium nail salon furniture crafted for discerning salon owners
            across the United States.
          </p>
        </div>

        <div>
          <p className="text-white text-sm font-semibold uppercase tracking-widest mb-4">
            Quick Links
          </p>
          <ul className="space-y-2">
            {[
              { label: "Home",       href: "/" },
              { label: "Products",   href: "/products" },
              { label: "Promotions", href: "/promotions" },
              { label: "About Us",   href: "/about" },
              { label: "Gallery",    href: "/gallery" },
              { label: "Contact",    href: "/contact" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm hover:text-gold-400 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-white text-sm font-semibold uppercase tracking-widest mb-4">
            Contact Us
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-gold-400 shrink-0" />
              <a
                href="tel:+18326623909"
                className="hover:text-gold-400 transition-colors"
              >
                (832) 662-3909
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-gold-400 shrink-0" />
              <a
                href="mailto:info@kashantcsilan.com"
                className="hover:text-gold-400 transition-colors"
              >
                info@kashantcsilan.com
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="text-gold-400 mt-0.5 shrink-0" />
              <span>Serving nail salons nationwide across the United States</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-white/40">
        <p>© {new Date().getFullYear()} Kashant C-Silan LLC. All rights reserved.</p>
        <p>Designed for the US nail salon market.</p>
      </div>
    </footer>
  );
}
