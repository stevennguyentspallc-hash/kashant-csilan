import { createServerSupabaseClient } from "@/lib/supabase/server";
import QuoteStatusSelect from "@/components/admin/QuoteStatusSelect";

export default async function AdminQuotesPage() {
  const supabase = await createServerSupabaseClient();

  const { data: quotes } = await supabase
    .from("quote_requests")
    .select("*, products(name)")
    .order("created_at", { ascending: false });

  const statusColor: Record<string, string> = {
    new:       "bg-green-50 text-green-600",
    contacted: "bg-blue-50 text-blue-600",
    quoted:    "bg-gold-400/10 text-gold-500",
    closed:    "bg-cream-100 text-charcoal-800/40",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Quote Requests</h1>
        <p className="text-charcoal-800/50 text-sm mt-1">{quotes?.length ?? 0} total requests</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream-100 bg-cream-50">
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/40">Customer</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/40">Product</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/40">State</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/40">Qty</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/40">Status</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/40">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {quotes && quotes.length > 0 ? quotes.map((q: {
              id: string;
              full_name: string;
              business_name?: string;
              email: string;
              phone?: string;
              state?: string;
              quantity: number;
              status: string;
              created_at: string;
              products: { name: string } | null;
            }) => (
              <tr key={q.id} className="hover:bg-cream-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-sm text-charcoal-900">{q.full_name}</p>
                  <p className="text-xs text-charcoal-800/40">{q.business_name || "—"}</p>
                  <p className="text-xs text-gold-400">{q.email}</p>
                  {q.phone && <p className="text-xs text-charcoal-800/40">{q.phone}</p>}
                </td>
                <td className="px-6 py-4 text-sm text-charcoal-800/60">
                  {q.products?.name ?? "General inquiry"}
                </td>
                <td className="px-6 py-4 text-sm text-charcoal-800/60">{q.state || "—"}</td>
                <td className="px-6 py-4 text-sm text-charcoal-800/60">{q.quantity}</td>
                <td className="px-6 py-4">
                  <QuoteStatusSelect quoteId={q.id} currentStatus={q.status} statusColor={statusColor} />
                </td>
                <td className="px-6 py-4 text-xs text-charcoal-800/40">
                  {new Date(q.created_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-charcoal-800/30 text-sm">
                  No quote requests yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
