import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Package, MessageSquare, Tag, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const [
    { count: productCount },
    { count: quoteCount },
    { count: newQuoteCount },
    { data: recentQuotes },
  ] = await Promise.all([
    supabase.from("products").select("*",       { count: "exact", head: true }),
    supabase.from("quote_requests").select("*", { count: "exact", head: true }),
    supabase.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { icon: Package,       label: "Products",     value: productCount  ?? 0, color: "bg-blue-50 text-blue-600",      href: "/admin/products" },
    { icon: MessageSquare, label: "Total Quotes",  value: quoteCount    ?? 0, color: "bg-gold-400/10 text-gold-500",  href: "/admin/quotes"   },
    { icon: TrendingUp,    label: "New Quotes",    value: newQuoteCount ?? 0, color: "bg-green-50 text-green-600",    href: "/admin/quotes"   },
    { icon: Tag,           label: "Categories",   value: 8,                  color: "bg-purple-50 text-purple-600",  href: "/admin/products" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">Dashboard</h1>
        <p className="text-charcoal-800/50 text-sm mt-1">Welcome back to Kashant Admin</p>
      </div>

      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6">
        {stats.map(({ icon: Icon, label, value, color, href }) => (
          <Link key={label} href={href}
            className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-cream-100 hover:shadow-md transition-shadow">
            <div className={`inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl mb-2 md:mb-3 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">{value}</p>
            <p className="text-[10px] md:text-xs text-charcoal-800/50 mt-1 uppercase tracking-wider">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent quotes */}
      <div className="bg-white rounded-2xl shadow-sm border border-cream-100">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-cream-100">
          <h2 className="font-serif text-base md:text-lg font-bold text-charcoal-900">Recent Quotes</h2>
          <Link href="/admin/quotes" className="text-xs text-gold-400 hover:underline uppercase tracking-wider">
            View All
          </Link>
        </div>
        <div className="divide-y divide-cream-100">
          {recentQuotes && recentQuotes.length > 0 ? (
            recentQuotes.map((q: {
              id: string; full_name: string; business_name?: string;
              email: string; state?: string; status: string; created_at: string;
            }) => (
              <div key={q.id} className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-charcoal-900 truncate">{q.full_name}</p>
                  <p className="text-xs text-charcoal-800/50 truncate">{q.business_name || q.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    q.status === "new" ? "bg-green-50 text-green-600" : "bg-cream-100 text-charcoal-800/50"
                  }`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-charcoal-800/30 text-sm">No quote requests yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
