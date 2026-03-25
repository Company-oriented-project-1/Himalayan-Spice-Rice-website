export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-red-800">Admin Module</p>
        <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Categories</h2>
        <p className="mt-2 text-stone-600">Organize your store categories and menu structure.</p>
      </header>

      <section className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm">
        <h3 className="font-title text-lg font-semibold text-orange-900">Category Organization</h3>
        <p className="mt-2 text-stone-700">Category management UI placeholder.</p>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-stone-600">
          Planned actions: reorder categories, assign products, and control visibility from one panel.
        </p>
      </section>
    </div>
  );
}
