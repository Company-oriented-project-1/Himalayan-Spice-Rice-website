import { getAdminDashboardDetailsAction } from "@/lib/actions";

export default async function AdminDashboardPage() {
  const dashboardResult = await getAdminDashboardDetailsAction();
  const details = dashboardResult?.data || null;

  const stats = {
    totalUsers: details?.totalUsers ?? 0,
    totalProducts: details?.totalProducts ?? 0,
    totalOrders: details?.totalOrders ?? 0,
    pendingOrders: details?.pendingOrders ?? 0
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-red-800">Admin Dashboard</p>
        <h2 className="font-title mt-2 text-3xl font-bold text-stone-900 md:text-4xl">Control Center</h2>
        <p className="mt-2 max-w-2xl text-stone-600">
          Monitor platform activity and manage core modules from one place.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-red-800">Total Users</p>
          <p className="mt-3 text-3xl font-bold text-red-900">{stats.totalUsers}</p>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-amber-800">Total Products</p>
          <p className="mt-3 text-3xl font-bold text-amber-900">{stats.totalProducts}</p>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-100 to-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-700">Total Orders</p>
          <p className="mt-3 text-3xl font-bold text-stone-900">{stats.totalOrders}</p>
        </article>

        <article className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-orange-800">Pending Orders</p>
          <p className="mt-3 text-3xl font-bold text-orange-900">{stats.pendingOrders}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white/90 p-6 shadow-sm">
        <h3 className="font-title text-lg font-semibold text-stone-900">Status</h3>
        <p className="mt-2 text-sm text-stone-600">
          Dashboard is connected to backend admin stats. Product and order metrics stay at zero until those schemas and APIs are added.
        </p>
        {dashboardResult?.error && (
          <p className="mt-3 text-sm font-medium text-red-700">{dashboardResult.error}</p>
        )}
      </section>
    </div>
  );
}