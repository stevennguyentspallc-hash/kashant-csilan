"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Row {
  name: string;
  category_slug: string;
  description: string;
  price_usd: string;
  dimensions: string;
  weight_lbs: string;
  lead_time: string;
  is_featured: string;
  color_1_name: string;
  color_1_hex: string;
  color_2_name: string;
  color_2_hex: string;
  color_3_name: string;
  color_3_hex: string;
  color_4_name: string;
  color_4_hex: string;
}

interface ImportResult {
  row: number;
  name: string;
  status: "success" | "error" | "skip";
  message: string;
}

export default function AdminImportPage() {
  const [file,      setFile]      = useState<File | null>(null);
  const [preview,   setPreview]   = useState<Row[]>([]);
  const [importing, setImporting] = useState(false);
  const [results,   setResults]   = useState<ImportResult[]>([]);
  const [step,      setStep]      = useState<"upload" | "preview" | "done">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Row[] => {
    const lines = text.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    return lines.slice(1).map(line => {
      const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) ?? line.split(",");
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = (vals[i] ?? "").trim().replace(/"/g, ""); });
      return obj as unknown as Row;
    }).filter(r => r.name?.trim());
  };

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      setPreview(rows);
      setStep("preview");
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setImporting(true);
    setResults([]);
    const supabase = createClient();
    const { data: cats } = await supabase.from("categories").select("id,slug");
    const catMap: Record<string, string> = {};
    (cats ?? []).forEach(c => { catMap[c.slug] = c.id; });

    const res: ImportResult[] = [];

    for (const [i, row] of preview.entries()) {
      try {
        if (!row.name?.trim()) {
          res.push({ row: i + 2, name: "(empty)", status: "skip", message: "Empty name, skipped" });
          continue;
        }

        const slug = row.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

        const categoryId = row.category_slug ? catMap[row.category_slug.trim()] ?? null : null;

        const { data: product, error: pErr } = await supabase
          .from("products")
          .upsert({
            name:        row.name.trim(),
            slug:        slug,
            category_id: categoryId,
            description: row.description?.trim() || null,
            price_usd:   row.price_usd ? parseFloat(row.price_usd) : null,
            dimensions:  row.dimensions?.trim() || null,
            weight_lbs:  row.weight_lbs ? parseFloat(row.weight_lbs) : null,
            lead_time:   row.lead_time?.trim() || null,
            is_featured: row.is_featured?.toLowerCase() === "true",
            is_active:   true,
            sort_order:  0,
          }, { onConflict: "slug" })
          .select().single();

        if (pErr) throw new Error(pErr.message);

        // Insert variants
        const colors = [
          { name: row.color_1_name, hex: row.color_1_hex },
          { name: row.color_2_name, hex: row.color_2_hex },
          { name: row.color_3_name, hex: row.color_3_hex },
          { name: row.color_4_name, hex: row.color_4_hex },
        ].filter(c => c.name?.trim());

        if (colors.length > 0 && product) {
          await supabase.from("product_variants").delete().eq("product_id", product.id);
          await supabase.from("product_variants").insert(
            colors.map((c, idx) => ({
              product_id: product.id,
              color_name: c.name.trim(),
              color_hex:  c.hex?.trim() || "#cccccc",
              sort_order: idx,
              in_stock:   true,
            }))
          );
        }

        res.push({ row: i + 2, name: row.name, status: "success", message: `Imported with ${colors.length} color(s)` });
      } catch (err: unknown) {
        res.push({ row: i + 2, name: row.name || "(error)", status: "error", message: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    setResults(res);
    setImporting(false);
    setStep("done");
  };

  const downloadTemplate = () => {
    const headers = "name,category_slug,description,price_usd,dimensions,weight_lbs,lead_time,is_featured,color_1_name,color_1_hex,color_2_name,color_2_hex,color_3_name,color_3_hex,color_4_name,color_4_hex";
    const example1 = `"Luxe Pro Pedicure Chair",pedicure-standard,"Premium massage pedicure chair with built-in jet system",1299,"28W x 52L x 45H in",185,"3-5 weeks",true,"Ivory White",#F5F0EB,"Jet Black",#1A1A1A,"Cappuccino",#8B6F47,,`;
    const example2 = `"Elite Manicure Table",single-nail-table,"Sleek single-sided manicure table with storage",649,"48W x 24D x 30H in",95,"2-4 weeks",false,"Pearl White",#F8F4EF,"Walnut Brown",#5C3D2E,,,`;
    const csv = [headers, example1, example2].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "kashant-products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount   = results.filter(r => r.status === "error").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">Bulk Import Products</h1>
        <p className="text-charcoal-800/50 text-sm mt-1">Upload CSV file to add multiple products at once</p>
      </div>

      {/* Step 1 — Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h2 className="font-semibold text-blue-900 mb-3">How to import</h2>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2"><span className="font-bold">1.</span> Download the CSV template below</li>
              <li className="flex gap-2"><span className="font-bold">2.</span> Fill in your product data (keep the header row)</li>
              <li className="flex gap-2"><span className="font-bold">3.</span> Use exact category slugs (e.g. pedicure-standard, single-nail-table)</li>
              <li className="flex gap-2"><span className="font-bold">4.</span> Save as CSV and upload here</li>
              <li className="flex gap-2"><span className="font-bold">5.</span> After import, upload images via Edit Product</li>
            </ol>
          </div>

          {/* Category slugs reference */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100">
            <h2 className="font-semibold text-charcoal-900 mb-4">Available Category Slugs</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                "pedicure-spa", "pedicure-standard", "pedicure-luxury", "pedicure-kid",
                "furniture", "single-nail-table", "double-nail-table", "triple-nail-table",
                "manicure-chair-main", "mc-combo", "mc-customer", "mc-technician", "mc-waiting", "mc-stool",
                "pedicart", "reception", "dry-station", "polish-rack-cabinet",
                "custom-furniture",
                "head-spa", "headspa-bed", "parts-accessories", "headspa-chair",
              ].map(slug => (
                <code key={slug} className="text-xs bg-cream-50 text-charcoal-800 px-3 py-1.5 rounded-lg border border-cream-200">
                  {slug}
                </code>
              ))}
            </div>
          </div>

          {/* Download template + Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={downloadTemplate}
              className="flex items-center justify-center gap-3 p-6 bg-white border-2 border-cream-200 rounded-2xl hover:border-gold-400 transition-colors group">
              <Download size={24} className="text-gold-400"/>
              <div className="text-left">
                <p className="font-semibold text-charcoal-900 group-hover:text-gold-500 transition-colors">Download Template</p>
                <p className="text-xs text-charcoal-800/40 mt-0.5">CSV file with example data</p>
              </div>
            </button>

            <label className="flex items-center justify-center gap-3 p-6 bg-white border-2 border-dashed border-cream-200 rounded-2xl hover:border-gold-400 transition-colors cursor-pointer group">
              <Upload size={24} className="text-charcoal-800/30 group-hover:text-gold-400 transition-colors"/>
              <div className="text-left">
                <p className="font-semibold text-charcoal-900">Upload CSV File</p>
                <p className="text-xs text-charcoal-800/40 mt-0.5">Click to select your file</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
            </label>
          </div>
        </div>
      )}

      {/* Step 2 — Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-charcoal-900">Preview — {preview.length} products found</h2>
              <p className="text-sm text-charcoal-800/50 mt-0.5">Review before importing</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep("upload"); setPreview([]); setFile(null); }}
                className="px-5 py-2.5 border border-cream-200 text-charcoal-800 text-sm rounded-full hover:border-charcoal-900 transition-colors">
                Back
              </button>
              <button onClick={handleImport} disabled={importing}
                className="px-5 py-2.5 bg-charcoal-900 text-white text-sm rounded-full hover:bg-gold-500 transition-colors disabled:opacity-50">
                {importing ? "Importing..." : `Import ${preview.length} Products`}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-100 bg-cream-50">
                  {["#","Name","Category","Price","Colors","Featured"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-800/40">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {preview.map((row, i) => {
                  const colors = [row.color_1_name, row.color_2_name, row.color_3_name, row.color_4_name].filter(Boolean);
                  return (
                    <tr key={i} className="hover:bg-cream-50">
                      <td className="px-4 py-3 text-charcoal-800/40">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-charcoal-900">{row.name}</td>
                      <td className="px-4 py-3 text-charcoal-800/60"><code className="text-xs bg-cream-100 px-2 py-0.5 rounded">{row.category_slug || "—"}</code></td>
                      <td className="px-4 py-3">{row.price_usd ? `$${row.price_usd}` : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {colors.map((c, ci) => (
                            <span key={ci} className="text-xs bg-cream-100 px-2 py-0.5 rounded">{c}</span>
                          ))}
                          {colors.length === 0 && <span className="text-charcoal-800/30 text-xs">none</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${row.is_featured?.toLowerCase() === "true" ? "bg-gold-400/10 text-gold-500" : "bg-cream-100 text-charcoal-800/40"}`}>
                          {row.is_featured?.toLowerCase() === "true" ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3 — Done */}
      {step === "done" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <p className="font-serif text-3xl font-bold text-green-600">{successCount}</p>
              <p className="text-sm text-green-700 mt-1">Imported</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
              <p className="font-serif text-3xl font-bold text-red-500">{errorCount}</p>
              <p className="text-sm text-red-600 mt-1">Failed</p>
            </div>
            <div className="bg-cream-50 border border-cream-200 rounded-2xl p-5 text-center">
              <p className="font-serif text-3xl font-bold text-charcoal-900">{results.length}</p>
              <p className="text-sm text-charcoal-800/50 mt-1">Total Rows</p>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-hidden">
            <div className="divide-y divide-cream-100">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  {r.status === "success" && <CheckCircle size={16} className="text-green-500 shrink-0"/>}
                  {r.status === "error"   && <XCircle size={16} className="text-red-500 shrink-0"/>}
                  {r.status === "skip"    && <AlertCircle size={16} className="text-yellow-500 shrink-0"/>}
                  <span className="text-sm font-medium text-charcoal-900 min-w-24">Row {r.row}</span>
                  <span className="text-sm text-charcoal-800/70 flex-1">{r.name}</span>
                  <span className={`text-xs ${r.status === "success" ? "text-green-600" : r.status === "error" ? "text-red-500" : "text-yellow-600"}`}>
                    {r.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setStep("upload"); setPreview([]); setResults([]); setFile(null); }}
              className="px-6 py-3 border border-cream-200 text-charcoal-800 text-sm rounded-full hover:border-charcoal-900 transition-colors">
              Import More
            </button>
            <a href="/admin/products"
              className="px-6 py-3 bg-charcoal-900 text-white text-sm rounded-full hover:bg-gold-500 transition-colors">
              View All Products →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}