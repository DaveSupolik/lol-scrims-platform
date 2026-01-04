import { createServerSupabaseClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  // 🔐 Global auth guard for dashboard
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b flex items-center px-6">
        <span className="font-semibold text-lg">recall.gg</span>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        {/* Sidebar (future: friends, profiles) */}
        <aside className="w-96 border-l p-4 hidden lg:block">
          <div className="text-sm text-gray-500">
            Friends & profile
            <br />
            <span className="text-xs">(coming soon)</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
