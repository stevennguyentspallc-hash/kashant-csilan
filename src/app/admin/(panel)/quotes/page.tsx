import { createServerSupabaseClient } from "@/lib/supabase/server";
import QuoteStatusSelect from "@/components/admin/QuoteStatusSelect";
export default async function AdminQuotesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: quotes } = await supabase
    .from("quote_requests")
    .select("*, products(name)")
    .order("created_at", { ascending: false });
  const statusColor: Record<string, string> = {
    new:       "bg-green-500/15 text-green-400",
    contacted: "bg-blue-500/15 text-blue-400",
    quoted:    "bg-gold-400/15 text-gold-400",
    closed:    "bg-wood-900 text-charcoal-800/50",
  };
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Quote Requests</h1>
        <p className="text-white/50 text-sm mt-1">{quotes?.length ?? 0} total requests</p>
      </div>
      <div className="bg-wood-50 rounded-2xl shadow-sm border border-wood-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-wood-800 bg-wood-900">
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/60">Customer</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/60">Product</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/60">State</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/60">Qty</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/60">Status</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-charcoal-800/60">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wood-800">
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
              <tr key={q.id} className="hover:bg-wood-100 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-sm text-charcoal-900">{q.full_name}</p>
                  <p className="text-xs text-charcoal-800/50">{q.business_name || "—"}</p>
                  <p className="text-xs text-gold-400">{q.email}</p>
                  {q.phone && <p className="text-xs text-charcoal-800/50">{q.phone}</p>}
                </td>
                <td className="px-6 py-4 text-sm text-charcoal-800/70">
                  {q.products?.name ?? "General inquiry"}
                </td>
                <td className="px-6 py-4 text-sm text-charcoal-800/70">{q.state || "—"}</td>
                <td className="px-6 py-4 text-sm text-charcoal-800/70">{q.quantity}</td>
                <td className="px-6 py-4">
                  <QuoteStatusSelect quoteId={q.id} currentStatus={q.status} statusColor={statusColor} />
                </td>
                <td className="px-6 py-4 text-xs text-charcoal-800/50">
                  {new Date(q.created_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-charcoal-800/40 text-sm">
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
