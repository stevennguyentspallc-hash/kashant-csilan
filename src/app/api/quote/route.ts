import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

const NOTIFY_EMAIL = "Cnail1911@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      full_name, business_name, email, phone,
      state, quantity, message, product_id, variant_id,
    } = body;

    // Save to Supabase
    const supabase = createClient();
    const { error: dbError } = await supabase.from("quote_requests").insert([{
      product_id:    product_id ?? null,
      variant_id:    variant_id ?? null,
      full_name,
      business_name: business_name ?? "",
      email,
      phone:         phone ?? "",
      state:         state ?? "",
      quantity:      Number(quantity) || 1,
      message:       message ?? "",
      status:        "new",
    }]);
    if (dbError) throw new Error(dbError.message);

    // Get product & variant names
    let productName = "General Inquiry";
    let variantName = "";
    if (product_id) {
      const { data: p } = await supabase.from("products").select("name").eq("id", product_id).single();
      if (p) productName = p.name;
    }
    if (variant_id) {
      const { data: v } = await supabase.from("product_variants").select("color_name").eq("id", variant_id).single();
      if (v) variantName = v.color_name;
    }

    // Send email via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from:    "Kashant Admin <onboarding@resend.dev>",
          to:      [NOTIFY_EMAIL],
          subject: `🛋️ New Quote Request — ${productName}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #F0E6D3;border-radius:12px;overflow:hidden;">
              <div style="background:#111;padding:24px 32px;">
                <h1 style="color:#C9A84C;font-size:20px;margin:0;letter-spacing:2px;">KASHANT C-SILAN LLC</h1>
                <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:4px 0 0;letter-spacing:1px;">NEW QUOTE REQUEST</p>
              </div>
              <div style="padding:32px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;color:#888;font-size:12px;width:140px;">CUSTOMER</td><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;font-weight:bold;">${full_name}</td></tr>
                  ${business_name ? `<tr><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;color:#888;font-size:12px;">SALON</td><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;">${business_name}</td></tr>` : ""}
                  <tr><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;color:#888;font-size:12px;">EMAIL</td><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;"><a href="mailto:${email}" style="color:#C9A84C;">${email}</a></td></tr>
                  ${phone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;color:#888;font-size:12px;">PHONE</td><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;"><a href="tel:${phone}" style="color:#C9A84C;">${phone}</a></td></tr>` : ""}
                  <tr><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;color:#888;font-size:12px;">STATE</td><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;">${state || "—"}</td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;color:#888;font-size:12px;">PRODUCT</td><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;font-weight:bold;">${productName}</td></tr>
                  ${variantName ? `<tr><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;color:#888;font-size:12px;">COLOR</td><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;">${variantName}</td></tr>` : ""}
                  <tr><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;color:#888;font-size:12px;">QTY</td><td style="padding:10px 0;border-bottom:1px solid #F0E6D3;">${quantity}</td></tr>
                  ${message ? `<tr><td style="padding:10px 0;color:#888;font-size:12px;vertical-align:top;">MESSAGE</td><td style="padding:10px 0;line-height:1.6;">${message}</td></tr>` : ""}
                </table>
                <div style="margin-top:32px;text-align:center;">
                  <a href="https://kashant-csilan.vercel.app/admin/dashboard" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
                    View in Admin Panel
                  </a>
                </div>
              </div>
              <div style="background:#FDFAF6;padding:16px 32px;text-align:center;color:#888;font-size:11px;">
                Kashant C-Silan LLC · (832) 662-3909
              </div>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Quote API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
