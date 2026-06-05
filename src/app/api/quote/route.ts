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

    // Get product name
    let productName = "General Inquiry";
    if (product_id) {
      const { data: p } = await supabase.from("products").select("name").eq("id", product_id).single();
      if (p) productName = p.name;
    }

    // Check API key
    const apiKey = process.env.RESEND_API_KEY;
    console.log("RESEND_API_KEY exists:", !!apiKey);
    console.log("RESEND_API_KEY length:", apiKey?.length ?? 0);

    if (!apiKey) {
      console.error("RESEND_API_KEY is missing!");
      return NextResponse.json({ success: true, warning: "Email not sent - missing API key" });
    }

    // Send email
    console.log("Sending email to:", NOTIFY_EMAIL);
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from:    "Kashant Admin <onboarding@resend.dev>",
        to:      ["cnail1911@gmail.com"],
        subject: `New Quote Request — ${productName}`,
        html:    `<p><b>From:</b> ${full_name} (${email})</p><p><b>Product:</b> ${productName}</p><p><b>State:</b> ${state}</p><p><b>Qty:</b> ${quantity}</p><p><b>Message:</b> ${message}</p>`,
      }),
    });

    const emailData = await emailRes.json();
    console.log("Resend response status:", emailRes.status);
    console.log("Resend response:", JSON.stringify(emailData));

    if (!emailRes.ok) {
      console.error("Resend error:", emailData);
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
