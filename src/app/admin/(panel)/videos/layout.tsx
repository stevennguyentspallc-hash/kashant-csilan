import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function VideosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-cream-50">
      <AdminSidebar />
      <main className="md:ml-64 pt-16 md:pt-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
