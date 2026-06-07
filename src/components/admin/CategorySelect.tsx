"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function CategorySelect({ value, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  const parents  = categories.filter((c) => !c.parent_id);
  const children = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors bg-white">
      <option value="">Select category</option>
      {parents.map((parent) => (
        <optgroup key={parent.id} label={`── ${parent.name}`}>
          <option value={parent.id}>{parent.name} (all)</option>
          {children(parent.id).map((child) => (
            <option key={child.id} value={child.id}>　{child.name}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
