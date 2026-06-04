"use client";
import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { submitQuoteRequest } from "@/lib/supabase/queries";
import type { Product, ProductVariant } from "@/types";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

interface Props {
  product: Product;
  selectedVariant: ProductVariant | null;
  onClose: () => void;
}

export default function QuoteModal({ product, selectedVariant, onClose }: Props) {
  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    email: "",
    phone: "",
    state: "",
    quantity: 1,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await submitQuoteRequest({
        product_id:    product.id,
        variant_id:    selectedVariant?.id ?? null,
        full_name:     form.full_name,
        business_name: form.business_name,
        email:         form.email,
        phone:         form.phone,
        state:         form.state,
        quantity:      Number(form.quantity),
        message:       form.message,
      });
      if (err) throw new Error(err);
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <div>
            <p className="text-xs tracking-widest uppercase text-gold-400 mb-1">
              Freight Quote
            </p>
            <h2 className="font-serif text-xl font-bold text-charcoal-900">
              {product.name}
            </h2>
            {selectedVariant && (
              <p className="text-sm text-charcoal-800/60 mt-0.5">
                Color: {selectedVariant.color_name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-charcoal-800/40 hover:text-charcoal-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center">
            <CheckCircle size={48} className="text-gold-400 mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold mb-2">Request Received!</h3>
            <p className="text-charcoal-800/60 text-sm">
              Thank you, {form.full_name}. Our team will contact you within 1
              business day with a freight quote.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-8 py-3 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">
                  Full Name *
                </label>
                <input
                  name="full_name"
                  required
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">
                  Salon Name
                </label>
                <input
                  name="business_name"
                  value={form.business_name}
                  onChange={handleChange}
                  className="w-full border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  placeholder="Luxury Nails & Spa"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  placeholder="jane@salon.com"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">
                  Ship-to State *
                </label>
                <select
                  name="state"
                  required
                  value={form.state}
                  onChange={handleChange}
                  className="w-full border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400 transition-colors bg-white"
                >
                  <option value="">Select state</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">
                  Quantity
                </label>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  max={999}
                  value={form.quantity}
                  onChange={handleChange}
                  className="w-full border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">
                Additional Notes
              </label>
              <textarea
                name="message"
                rows={3}
                value={form.message}
                onChange={handleChange}
                className="w-full border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400 transition-colors resize-none"
                placeholder="Any specific requirements, delivery timeline, etc."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Quote Request"}
            </button>

            <p className="text-center text-xs text-charcoal-800/40">
              We typically respond within 1 business day.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
