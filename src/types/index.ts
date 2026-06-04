export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string | null;
  image_url: string | null;
  in_stock: boolean;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price_usd: number | null;
  dimensions: string | null;
  weight_lbs: number | null;
  lead_time: string | null;
  is_featured: boolean;
  categories?: Category;
  product_variants?: ProductVariant[];
}

export interface QuoteRequest {
  product_id: string | null;
  variant_id: string | null;
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  state: string;
  quantity: number;
  message: string;
}
