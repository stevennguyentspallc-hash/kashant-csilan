import { createClient } from "./client";
import type { Product, Category, QuoteRequest } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_variants(*)")
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_variants(*)")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;

  if (categorySlug) {
    return (data ?? []).filter((p) => p.categories?.slug === categorySlug);
  }
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_variants(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error) return null;
  return data;
}

export async function submitQuoteRequest(
  payload: QuoteRequest
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("quote_requests").insert([payload]);
  if (error) return { error: error.message };
  return { error: null };
}
