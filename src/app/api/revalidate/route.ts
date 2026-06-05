import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/products/[slug]", "page");
    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
