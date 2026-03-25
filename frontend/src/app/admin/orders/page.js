export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-red-800">Admin Module</p>
        <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Orders</h2>
        <p className="mt-2 text-stone-600">Track incoming orders and fulfillment status.</p>
      </header>

      <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
        <h3 className="font-title text-lg font-semibold text-amber-900">Order Operations</h3>
        <p className="mt-2 text-stone-700">Order management UI will be connected when order schema is available.</p>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-stone-600">
          Planned actions: review new orders, update statuses, and monitor pending fulfillment.
        </p>
      </section>
    </div>
  );
}
