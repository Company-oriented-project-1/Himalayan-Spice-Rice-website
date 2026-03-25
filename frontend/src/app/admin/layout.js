import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "../api/auth/[...nextauth]/route";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" }
];

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <section className="min-h-screen bg-[#FDFBF7] text-stone-800">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-stone-200 bg-white/90 p-6 backdrop-blur-sm lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-red-800">Admin Console</p>
             <img src="/logo.png" alt="Himalayan Spice Rice" className="h-20 w-auto" />
          </div>

          <AdminSidebarNav links={adminLinks} />

          <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm">
            <p className="text-stone-600">Signed in as</p>
            <p className="mt-1 font-semibold text-stone-900">{session.user?.name || "Admin"}</p>
            <p className="text-xs text-stone-500">{session.user?.email}</p>
            <div className="mt-4">
              <AdminSignOutButton />
            </div>
          </div>
        </aside>

        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.20),_transparent_42%),radial-gradient(circle_at_top_left,_rgba(153,27,27,0.10),_transparent_36%)]">
          <main className="p-6 md:p-10">{children}</main>
        </div>
      </div>
    </section>
  );
}
