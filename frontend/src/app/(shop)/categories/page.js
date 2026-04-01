"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';

const CATEGORY_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(`${CATEGORY_API_BASE}/api/category`, {
          method: 'GET',
          cache: 'no-store'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to fetch categories');
        }

        if (!cancelled) {
          setCategories(Array.isArray(data?.categories) ? data.categories : []);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(String(error?.message || 'Failed to fetch categories'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <div className="flex items-center text-sm text-stone-500 mb-6">
        <button onClick={() => router.push('/')} className="hover:text-red-800 transition-colors">Home</button>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-stone-800 font-medium">All Categories</span>
      </div>

      <div className="mb-10 border-b border-stone-100 pb-6">
        <h1 className="text-3xl md:text-4xl font-black text-stone-800 mb-3">Shop by Category</h1>
        <p className="text-stone-500 max-w-2xl">Browse our wide selection of authentic Himalayan and Asian groceries.</p>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-700 shadow-sm">
          <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
          Loading categories...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 shadow-sm">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && categories.length === 0 && (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100">
          <div className="text-5xl mb-3">🧺</div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">No active categories found</h2>
          <p className="text-stone-500">Please check back soon.</p>
        </div>
      )}

      {!isLoading && !errorMessage && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div
              key={category.id}
              onClick={() => router.push(`/categories/${category.slug}`)}
              className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
            >
              <div className="h-48 w-full relative overflow-hidden bg-stone-100">
                <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-200 via-orange-100 to-stone-100" />
                )}
              </div>
              <div className="p-6 relative bg-white">
                <h3 className="font-bold text-xl text-stone-800 group-hover:text-red-800 transition-colors mb-2">{category.name}</h3>
                <p className="text-stone-500 text-sm line-clamp-2">
                  {category.description || `Explore premium ${category.name.toLowerCase()} & more.`}
                </p>
                <div className="mt-3 text-xs text-stone-500">{category.productCount || 0} active products</div>
                <div className="mt-3 text-red-800 font-medium text-sm flex items-center group-hover:translate-x-2 transition-transform">
                  Browse category <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}