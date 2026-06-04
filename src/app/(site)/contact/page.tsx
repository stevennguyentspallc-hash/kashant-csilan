"use client";
import { useState } from "react";
import { Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ContactPage() {
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
      const supabase = createClient();
      const { error: err } = await supabase.from("quote_requests").insert([{
        product_id:    null,
        variant_id:    null,
        full_name:     form.full_name,
        business_name: form.business_name,
        email:         form.email,
        phone:         form.phone,
        state:         form.state,
        quantity:      1,
        message:       form.message,
      }]);
      if (err) throw new Error(err.message);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-charcoal-900 pt-32 pb-20 px-6 text-center">
        <p className="text-gold-400 text-xs tracking-widest2 uppercase mb-4">
          Get in Touch
        </p>
        <h1 className="font-serif text-5xl font-bold text-white mb-4">
          Contact Us
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Have questions? Ready to furnish your salon? Our team is here to help.
        </p>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact info */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal-900">
              Reach Us Directly
            </h2>

            {[
              {
                icon: Phone,
                label: "Phone",
                value: "(832) 662-3909",
                href: "tel:+18326623909",
              },
              {
                icon: Mail,
                label: "Email",
                value: "info@kashantcsilan.com",
                href: "mailto:info@kashantcsilan.com",
              },
              {
                icon: Clock,
                label: "Hours",
                value: "Mon–Sat: 9AM – 6PM CST",
                href: null,
              },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4">
                <div className="w-10 h-10 bg-gold-400/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-gold-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-charcoal-800/40 mb-0.5">
                    {label}
                  </p>
                  {href ? (
                    <a href={href} className="text-sm text-charcoal-900 hover:text-gold-400 transition-colors">
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm text-charcoal-900">{value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-4 p-6 bg-charcoal-900 rounded-2xl text-white">
              <p className="text-xs uppercase tracking-widest text-gold-400 mb-2">
                Bilingual Support
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                Chúng tôi hỗ trợ tiếng Việt. Liên hệ trực tiếp để được tư
                vấn bằng tiếng Việt.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-cream-100">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle size={52} className="text-gold-400 mb-4" />
                <h3 className="font-serif text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-charcoal-800/60 text-sm">
                  We&apos;ll get back to you within 1 business day.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-6">
                  Send a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        name="full_name" required value={form.full_name}
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
                        name="business_name" value={form.business_name}
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
                        name="email" type="email" required value={form.email}
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
                        name="phone" value={form.phone} onChange={handleChange}
                        className="w-full border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                        placeholder="(555) 000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-charcoal-800/50 mb-1 block">
                      Message *
                    </label>
                    <textarea
                      name="message" required rows={5} value={form.message}
                      onChange={handleChange}
                      className="w-full border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400 transition-colors resize-none"
                      placeholder="Tell us about your salon, what products you're interested in, your timeline..."
                    />
                  </div>
                  <button
                    type="submit" disabled={loading}
                    className="w-full py-4 bg-charcoal-900 text-white text-sm tracking-widest uppercase hover:bg-gold-500 transition-colors rounded-full disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
