import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

const BASE_URL = "https://kashant-csilan.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:  "Kashant C-Silan LLC — Premium Nail Salon Furniture",
    template: "%s | Kashant C-Silan LLC",
  },
  description:
    "Premium nail salon furniture for US nail salons. Shop pedicure chairs, manicure tables, reception desks & more. Nationwide freight delivery. Get a free quote today.",
  keywords: [
    "nail salon furniture",
    "pedicure chairs",
    "manicure tables",
    "nail salon equipment",
    "salon furniture USA",
    "reception desk salon",
    "spa beds",
    "nail dryer station",
    "salon supply",
    "freight delivery salon furniture",
  ],
  authors: [{ name: "Kashant C-Silan LLC" }],
  creator: "Kashant C-Silan LLC",
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         BASE_URL,
    siteName:    "Kashant C-Silan LLC",
    title:       "Kashant C-Silan LLC — Premium Nail Salon Furniture",
    description: "Luxury nail salon furniture for modern US salons. Pedicure chairs, manicure tables, reception desks. Nationwide delivery.",
    images: [
      {
        url:    "/og-image.jpg",
        width:  1200,
        height: 630,
        alt:    "Kashant C-Silan LLC — Premium Nail Salon Furniture",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Kashant C-Silan LLC — Premium Nail Salon Furniture",
    description: "Luxury nail salon furniture for modern US salons. Nationwide delivery.",
    images:      ["/og-image.jpg"],
  },
  robots: {
    index:               true,
    follow:              true,
    googleBot: {
      index:             true,
      follow:            true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-cream-50 text-charcoal-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
