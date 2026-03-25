export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-red-800">Admin Module</p>
        <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Products</h2>
        <p className="mt-2 text-stone-600">Create, update, and review product inventory.</p>
      </header>

      <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
        <h3 className="font-title text-lg font-semibold text-amber-900">Inventory Control</h3>
        <p className="mt-2 text-stone-700">Product management UI will be connected after product schema integration.</p>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-stone-600">
          Planned actions: add products, update stock, edit pricing, and publish or unpublish listings.
        </p>
      </section>
    </div>
  );
}
