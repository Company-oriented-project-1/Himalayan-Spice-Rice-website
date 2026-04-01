"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ProductCard from '@/components/ProductCard';

const CATEGORY_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const PAGE_LIMIT = 10;

const mapProduct = (product) => ({
  id: product?.id,
  slug: product?.slug,
  name: product?.name || 'Product',
  image: Array.isArray(product?.images) && product.images[0] ? product.images[0] : '',
  price: Number(product?.price || 0),
  salePrice: product?.salePrice == null ? null : Number(product.salePrice),
  quantity: product?.quantity || 1,
  unit: product?.unit || 'kg',
  stock: Number(product?.stock || 0),
  rating: null
});

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = String(params.id || '');

  const [sortBy, setSortBy] = React.useState('popular');
  const [search, setSearch] = React.useState('');
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');
  const [page, setPage] = React.useState(1);

  const [category, setCategory] = React.useState(null);
  const [products, setProducts] = React.useState([]);
  const [pagination, setPagination] = React.useState({ page: 1, totalPages: 1, total: 0, limit: PAGE_LIMIT });
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    setPage(1);
  }, [categorySlug, sortBy, search, minPrice, maxPrice]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadCategoryDetails() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const query = new URLSearchParams();
        query.set('page', String(page));
        query.set('limit', String(PAGE_LIMIT));
        query.set('sort', sortBy);
        if (search.trim()) query.set('search', search.trim());
        if (minPrice !== '') query.set('minPrice', minPrice);
        if (maxPrice !== '') query.set('maxPrice', maxPrice);

        const response = await fetch(
          `${CATEGORY_API_BASE}/api/category/${encodeURIComponent(categorySlug)}?${query.toString()}`,
          {
            method: 'GET',
            cache: 'no-store'
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to fetch category details');
        }

        if (!cancelled) {
          setCategory(data?.category || null);
          setProducts(Array.isArray(data?.products) ? data.products.map(mapProduct) : []);
          setPagination(
            data?.pagination || {
              page,
              totalPages: 1,
              total: 0,
              limit: PAGE_LIMIT
            }
          );
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(String(error?.message || 'Failed to fetch category details'));
          setCategory(null);
          setProducts([]);
          setPagination({ page: 1, totalPages: 1, total: 0, limit: PAGE_LIMIT });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (categorySlug) {
      loadCategoryDetails();
    }

    return () => {
      cancelled = true;
    };
  }, [categorySlug, sortBy, search, minPrice, maxPrice, page]);

  const pageNumber = Number(pagination?.page || 1);
  const totalPages = Math.max(Number(pagination?.totalPages || 1), 1);
  const totalResults = Number(pagination?.total || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <div className="flex items-center text-sm text-stone-500 mb-6">
        <button onClick={() => router.push('/')} className="hover:text-red-800 transition-colors">Home</button>
        <ChevronRight size={14} className="mx-2" />
        <button onClick={() => router.push('/categories')} className="hover:text-red-800 transition-colors">Categories</button>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-stone-800 font-medium">{category?.name || 'Category'}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-stone-100 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-stone-800 mb-3">{category?.name || 'Category'}</h1>
          <p className="text-stone-500 max-w-2xl">
            {category?.description || `Explore our premium selection of ${category?.name?.toLowerCase() || 'items'}.`}
          </p>
        </div>
        
        <div className="w-full md:w-auto grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search in this category"
            className="bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-lg block p-2.5 outline-none"
          />
          <input
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Min €"
            className="bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-lg block p-2.5 outline-none w-full sm:w-28"
          />
          <input
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Max €"
            className="bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-lg block p-2.5 outline-none w-full sm:w-28"
          />
          <label className="text-sm font-medium text-stone-600 flex items-center gap-2">
            <SlidersHorizontal size={16} /> Sort by:
          </label>
          <select
            className="bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-lg focus:ring-red-800 focus:border-red-800 block p-2.5 outline-none font-medium cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="latest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {!isLoading && !errorMessage && (
        <div className="mb-6 text-sm text-stone-500">
          Showing {products.length} of {totalResults} products
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-700 shadow-sm">
          <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
          Loading category products...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 shadow-sm">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && products.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">No products found</h2>
          <Button onClick={() => router.push('/products')}>View All Products</Button>
        </div>
      ) : (
        !isLoading && !errorMessage && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={pageNumber <= 1}
                  className="px-4 py-2 rounded-lg border border-stone-200 bg-white text-sm font-medium text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      onClick={() => setPage(value)}
                      className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                        value === pageNumber
                          ? 'border-red-800 bg-red-800 text-white'
                          : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={pageNumber >= totalPages}
                  className="px-4 py-2 rounded-lg border border-stone-200 bg-white text-sm font-medium text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}