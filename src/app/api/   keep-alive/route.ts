import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Pinged once a day by Vercel Cron (see vercel.json) so the Supabase
// free-tier project never sits idle for 7 days and gets auto-paused.
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("categories").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
