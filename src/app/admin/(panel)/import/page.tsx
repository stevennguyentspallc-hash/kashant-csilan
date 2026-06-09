"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

interface Row {
  name: string;
  category_slug: string;
  description: string;
  price_usd: string;
  dimensions: string;
  weight_lbs: string;
  lead_time: string;
  is_featured: string;
  color_1_name: string; color_1_hex: string;
  color_2_name: string; color_2_hex: string;
  color_3_name: string; color_3_hex: string;
  color_4_name: string; color_4_hex: string;
}

interface ImportResult {
  row: number; name: string;
  status: "success" | "error" | "skip"; message: string;
}

const CATEGORY_SLUGS = [
  "pedicure-spa", "pedicure-standard", "pedicure-luxury", "pedicure-kid",
  "furniture", "single-nail-table", "double-nail-table", "triple-nail-table",
  "manicure-chair-main", "mc-combo", "mc-customer", "mc-technician", "mc-waiting", "mc-stool",
  "pedicart", "reception", "dry-station", "polish-rack-cabinet",
  "custom-furniture",
  "head-spa", "headspa-bed", "parts-accessories", "headspa-chair",
];

const CATEGORY_LABELS: Record<string, string> = {
  "pedicure-spa":        "Pedicure Spa",
  "pedicure-standard":   "Pedicure Spa → Standard",
  "pedicure-luxury":     "Pedicure Spa → Luxury",
  "pedicure-kid":        "Pedicure Spa → Kid",
  "furniture":           "Furniture",
  "single-nail-table":   "Furniture → Single Nail Table",
  "double-nail-table":   "Furniture → Double Nail Table",
  "triple-nail-table":   "Furniture → Triple Nail Table",
  "manicure-chair-main": "Manicure Chair",
  "mc-combo":            "Manicure Chair → Combo",
  "mc-customer":         "Manicure Chair → Customer Chair",
  "mc-technician":       "Manicure Chair → Technician Chair",
  "mc-waiting":          "Manicure Chair → Waiting Chair",
  "mc-stool":            "Manicure Chair → Stool Chair",
  "pedicart":            "Furniture → Pedicart",
  "reception":           "Furniture → Reception",
  "dry-station":         "Furniture → Dry Station",
  "polish-rack-cabinet": "Furniture → Polish Rack Cabinet",
  "custom-furniture":    "Custom Furniture",
  "head-spa":            "Head Spa",
  "headspa-bed":         "Head Spa → Headspa Bed",
  "parts-accessories":   "Head Spa → Parts & Accessories",
  "headspa-chair":       "Head Spa → Chair",
};

export default function AdminImportPage() {
  const [file,      setFile]      = useState<File | null>(null);
  const [preview,   setPreview]   = useState<Row[]>([]);
  const [importing, setImporting] = useState(false);
  const [results,   setResults]   = useState<ImportResult[]>([]);
  const [step,      setStep]      = useState<"upload" | "preview" | "done">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Download Excel Template with dropdowns ──────────────────────
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Products data entry ──
    const headers = [
      "name", "category_slug", "description",
      "price_usd", "dimensions", "weight_lbs", "lead_time", "is_featured",
      "color_1_name", "color_1_hex",
      "color_2_name", "color_2_hex",
      "color_3_name", "color_3_hex",
      "color_4_name", "color_4_hex",
    ];

    const examples = [
      ["Luxe Pro Pedicure Chair", "pedicure-standard", "Premium massage pedicure chair with jet system", 1299, "28W x 52L x 45H in", 185, "3-5 weeks", "TRUE", "Ivory White", "#F5F0EB", "Jet Black", "#1A1A1A", "Cappuccino", "#8B6F47", "", ""],
      ["Elite Manicure Table",    "single-nail-table",  "Sleek manicure table with storage drawers",       649, "48W x 24D x 30H in",  95, "2-4 weeks", "FALSE", "Pearl White", "#F8F4EF", "Walnut Brown", "#5C3D2E", "", "", "", ""],
    ];

    const wsData = [headers, ...examples];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws["!cols"] = [
      { wch: 30 }, { wch: 22 }, { wch: 40 },
      { wch: 10 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 16 }, { wch: 12 },
      { wch: 16 }, { wch: 12 },
      { wch: 16 }, { wch: 12 },
      { wch: 16 }, { wch: 12 },
    ];

    // Data validation — category dropdown for column B (rows 2-200)
    ws["!dataValidations"] = [
      {
        sqref: "B2:B200",
        type: "list",
        formula1: `"${CATEGORY_SLUGS.join(",")}"`,
        showDropDown: false,
        showErrorMessage: true,
        errorTitle: "Invalid Category",
        error: "Please select a valid category slug from the dropdown list",
      },
      {
        sqref: "H2:H200",
        type: "list",
        formula1: '"TRUE,FALSE"',
        showDropDown: false,
      },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Products");

    // ── Sheet 2: Category Reference ──
    const refData = [
      ["Category Slug (use in column B)", "Category Name / Path"],
      ...CATEGORY_SLUGS.map(slug => [slug, CATEGORY_LABELS[slug] ?? slug]),
    ];
    const wsRef = XLSX.utils.aoa_to_sheet(refData);
    wsRef["!cols"] = [{ wch: 28 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsRef, "Category Reference");

    // ── Sheet 3: Color Hex Guide ──
    const colorData = [
      ["Color Name", "Hex Code", "Preview"],
      ["Ivory White",    "#F5F0EB", ""],
      ["Jet Black",      "#1A1A1A", ""],
      ["Cappuccino",     "#8B6F47", ""],
      ["Pearl White",    "#F8F4EF", ""],
      ["Walnut Brown",   "#5C3D2E", ""],
      ["Marble White",   "#FAFAFA", ""],
      ["Charcoal Gray",  "#2C2C2C", ""],
      ["Champagne Gold", "#C9A84C", ""],
      ["Blush Pink",     "#F2C4CE", ""],
      ["Navy Blue",      "#1B2A4A", ""],
      ["Forest Green",   "#2D5016", ""],
      ["Burgundy",       "#6B1E2E", ""],
    ];
    const wsColor = XLSX.utils.aoa_to_sheet(colorData);
    wsColor["!cols"] = [{ wch: 18 }, { wch: 14 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsColor, "Color Guide");

    XLSX.writeFile(wb, "kashant-products-template.xlsx");
  };

  // ── Parse uploaded file ──────────────────────────────────────────
  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb   = XLSX.read(data, { type: "array" });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: "" });
      setPreview(json.filter(r => r.name?.toString().trim()));
      setStep("preview");
    };
    reader.readAsArrayBuffer(f);
  };

  // ── Import to Supabase ───────────────────────────────────────────
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
        const name = row.name?.toString().trim();
        if (!name) { res.push({ row: i+2, name:"(empty)", status:"skip", message:"Empty name" }); continue; }

        const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim();
        const categoryId = row.category_slug ? catMap[row.category_slug.toString().trim()] ?? null : null;

        const { data: product, error: pErr } = await supabase
          .from("products")
          .upsert({
            name, slug,
            category_id: categoryId,
            description: row.description?.toString().trim() || null,
            price_usd:   row.price_usd ? parseFloat(row.price_usd.toString()) : null,
            dimensions:  row.dimensions?.toString().trim() || null,
            weight_lbs:  row.weight_lbs ? parseFloat(row.weight_lbs.toString()) : null,
            lead_time:   row.lead_time?.toString().trim() || null,
            is_featured: row.is_featured?.toString().toLowerCase() === "true",
            is_active: true, sort_order: 0,
          }, { onConflict: "slug" })
          .select().single();

        if (pErr) throw new Error(pErr.message);

        const colors = [
          { name: row.color_1_name, hex: row.color_1_hex },
          { name: row.color_2_name, hex: row.color_2_hex },
          { name: row.color_3_name, hex: row.color_3_hex },
          { name: row.color_4_name, hex: row.color_4_hex },
        ].filter(c => c.name?.toString().trim());

        if (colors.length > 0 && product) {
          await supabase.from("product_variants").delete().eq("product_id", product.id);
          await supabase.from("product_variants").insert(
            colors.map((c, idx) => ({
              product_id: product.id,
              color_name: c.name.toString().trim(),
              color_hex:  c.hex?.toString().trim() || "#cccccc",
              sort_order: idx, in_stock: true,
            }))
          );
        }

        res.push({ row: i+2, name, status:"success", message:`✓ ${colors.length} color(s)` });
      } catch (err: unknown) {
        res.push({ row: i+2, name: row.name?.toString() || "error", status:"error", message: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    setResults(res);
    setImporting(false);
    setStep("done");
  };

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount   = results.filter(r => r.status === "error").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal-900">Bulk Import Products</h1>
        <p className="text-charcoal-800/50 text-sm mt-1">Upload Excel file to add multiple products at once</p>
      </div>

      {step === "upload" && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h2 className="font-semibold text-blue-900 mb-3">How to use</h2>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2"><span className="font-bold">1.</span> Download Excel template (has dropdowns for category & featured)</li>
              <li className="flex gap-2"><span className="font-bold">2.</span> Fill in products — use dropdown in column B to select category</li>
              <li className="flex gap-2"><span className="font-bold">3.</span> Check the <b>Category Reference</b> sheet for all available categories</li>
              <li className="flex gap-2"><span className="font-bold">4.</span> Upload the filled Excel file here</li>
              <li className="flex gap-2"><span className="font-bold">5.</span> After import, go to each product to upload images</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={downloadTemplate}
              className="flex items-center gap-4 p-6 bg-white border-2 border-cream-200 rounded-2xl hover:border-gold-400 transition-colors group text-left">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <FileSpreadsheet size={24} className="text-green-600"/>
              </div>
              <div>
                <p className="font-semibold text-charcoal-900 group-hover:text-gold-500 transition-colors">Download Excel Template</p>
                <p className="text-xs text-charcoal-800/40 mt-0.5">With category dropdowns + color guide</p>
              </div>
            </button>

            <label className="flex items-center gap-4 p-6 bg-white border-2 border-dashed border-cream-200 rounded-2xl hover:border-gold-400 transition-colors cursor-pointer group text-left">
              <div className="w-12 h-12 bg-cream-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-gold-400/10 transition-colors">
                <Upload size={24} className="text-charcoal-800/30 group-hover:text-gold-400 transition-colors"/>
              </div>
              <div>
                <p className="font-semibold text-charcoal-900">Upload Excel File</p>
                <p className="text-xs text-charcoal-800/40 mt-0.5">.xlsx or .csv accepted</p>
              </div>
              <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
            </label>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-charcoal-900">{preview.length} products ready to import</h2>
              <p className="text-sm text-charcoal-800/50 mt-0.5">Review before importing — file: {file?.name}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep("upload"); setPreview([]); }}
                className="px-5 py-2.5 border border-cream-200 text-charcoal-800 text-sm rounded-full hover:border-charcoal-900 transition-colors">
                Back
              </button>
              <button onClick={handleImport} disabled={importing}
                className="px-5 py-2.5 bg-charcoal-900 text-white text-sm rounded-full hover:bg-gold-500 transition-colors disabled:opacity-50 min-w-36">
                {importing ? "Importing..." : `Import ${preview.length} Products`}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-100 bg-cream-50">
                  {["#","Name","Category","Price","Dimensions","Colors","Featured"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal-800/40 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {preview.map((row, i) => {
                  const colors = [row.color_1_name, row.color_2_name, row.color_3_name, row.color_4_name].filter(c => c?.toString().trim());
                  return (
                    <tr key={i} className="hover:bg-cream-50">
                      <td className="px-4 py-3 text-charcoal-800/40 text-xs">{i+1}</td>
                      <td className="px-4 py-3 font-medium text-charcoal-900 max-w-48 truncate">{row.name?.toString()}</td>
                      <td className="px-4 py-3"><code className="text-xs bg-cream-100 px-2 py-0.5 rounded whitespace-nowrap">{row.category_slug?.toString() || "—"}</code></td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.price_usd ? `$${row.price_usd}` : "—"}</td>
                      <td className="px-4 py-3 text-xs text-charcoal-800/60 whitespace-nowrap">{row.dimensions?.toString() || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {colors.length > 0
                            ? colors.map((c, ci) => <span key={ci} className="text-xs bg-cream-100 px-2 py-0.5 rounded whitespace-nowrap">{c.toString()}</span>)
                            : <span className="text-charcoal-800/30 text-xs">—</span>
                          }
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${row.is_featured?.toString().toLowerCase() === "true" ? "bg-gold-400/10 text-gold-500" : "bg-cream-100 text-charcoal-800/40"}`}>
                          {row.is_featured?.toString().toLowerCase() === "true" ? "Featured" : "Normal"}
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

      {step === "done" && (
        <div className="space-y-4">
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
              <p className="text-sm text-charcoal-800/50 mt-1">Total</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-hidden max-h-96 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-cream-50 last:border-0">
                {r.status === "success" && <CheckCircle size={15} className="text-green-500 shrink-0"/>}
                {r.status === "error"   && <XCircle size={15} className="text-red-500 shrink-0"/>}
                {r.status === "skip"    && <AlertCircle size={15} className="text-yellow-500 shrink-0"/>}
                <span className="text-xs text-charcoal-800/40 w-12 shrink-0">Row {r.row}</span>
                <span className="text-sm text-charcoal-900 flex-1 truncate">{r.name}</span>
                <span className={`text-xs shrink-0 ${r.status==="success"?"text-green-600":r.status==="error"?"text-red-500":"text-yellow-600"}`}>{r.message}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setStep("upload"); setPreview([]); setResults([]); setFile(null); }}
              className="px-6 py-3 border border-cream-200 text-charcoal-800 text-sm rounded-full hover:border-charcoal-900 transition-colors">
              Import More
            </button>
            <a href="/admin/products"
              className="px-6 py-3 bg-charcoal-900 text-white text-sm rounded-full hover:bg-gold-500 transition-colors inline-block">
              View All Products →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}