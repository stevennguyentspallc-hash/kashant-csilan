"use client";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
  activeCategory?: string;
}

export default function ProductsFilter({ categories, activeCategory }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setCategory = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    router.push(`/products?${params.toString()}`);
  };

  const allCategories = [
    { name: "All",              slug: undefined },
    ...categories.map((c) => ({ name: c.name, slug: c.slug })),
    // Static fallback if DB empty
    ...(categories.length === 0
      ? [
          { name: "Pedicure Chairs",     slug: "pedicure-chairs" },
          { name: "Manicure Tables",     slug: "manicure-tables" },
          { name: "Reception Desks",     slug: "reception-desks" },
          { name: "Salon Chairs",        slug: "salon-chairs" },
          { name: "Nail Dryer Stations", slug: "nail-dryer-stations" },
          { name: "Spa Beds",            slug: "spa-beds" },
          { name: "Polish Rack Cabinet", slug: "polish-rack-cabinet" },
          { name: "Padset",              slug: "padset" },
        ]
      : []),
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {allCategories.map(({ name, slug }) => (
        <button
          key={name}
          onClick={() => setCategory(slug)}
          className={`px-5 py-2 rounded-full text-sm tracking-wide border transition-all ${
            activeCategory === slug || (!activeCategory && !slug)
              ? "bg-charcoal-900 text-white border-charcoal-900"
              : "bg-white text-charcoal-800 border-cream-200 hover:border-gold-400"
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
