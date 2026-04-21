"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ProductCard from '@/components/ProductCard';

const PRODUCTS_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const mapProduct = (product) => ({
  id: product?.id,
  slug: product?.slug,
  name: product?.name || 'Product',
  description: product?.description || '',
  image: Array.isArray(product?.images) && product.images[0] ? product.images[0] : '',
  price: Number(product?.price || 0),
  salePrice: product?.salePrice == null ? null : Number(product.salePrice),
  quantity: product?.quantity || 1,
  unit: product?.unit || 'kg',
  rating: null,
  stock: Number(product?.stock || 0),
  categoryName: product?.category?.name || ''
});

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = (searchParams.get('q') || '').trim();
  const [sortBy, setSortBy] = useState('popular');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSearchResults() {
      if (!query) {
        if (!cancelled) {
          setProducts([]);
          setErrorMessage('');
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(
          `${PRODUCTS_API_BASE}/api/products?limit=100&search=${encodeURIComponent(query)}`,
          {
            method: 'GET',
            cache: 'no-store'
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load search results');
        }

        if (!cancelled) {
          const nextProducts = Array.isArray(data?.products) ? data.products.map(mapProduct) : [];
          setProducts(nextProducts);
        }
      } catch (error) {
        if (!cancelled) {
          setProducts([]);
          setErrorMessage(String(error?.message || 'Failed to load search results'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSearchResults();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const filteredProducts = useMemo(() => {
    const prods = [...products];

    switch(sortBy) {
      case 'price-low': return prods.sort((a, b) => a.price - b.price);
      case 'price-high': return prods.sort((a, b) => b.price - a.price);
      case 'rating': return prods.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
      default: return prods;
    }
  }, [products, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-stone-100 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-stone-800 mb-3">Search Results</h1>
          <p className="text-stone-500 max-w-2xl">Showing results for &quot;<span className="font-bold text-stone-800">{query}</span>&quot;</p>
        </div>
        
        {filteredProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-stone-600 flex items-center gap-2">
              <SlidersHorizontal size={16} /> Sort by:
            </label>
            <select 
              className="bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-lg focus:ring-red-800 block p-2.5 cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-100">
          <Loader2 className="mx-auto mb-3 animate-spin text-stone-600" size={22} />
          <p className="text-stone-600">Searching products...</p>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-100">
          <h2 className="text-xl font-bold text-red-800 mb-2">Search unavailable</h2>
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {!isLoading && !errorMessage && filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            {query ? 'No matches found' : 'Start typing to search products'}
          </h2>
          {query && (
            <p className="text-stone-500 mb-4">Try a different keyword or browse all products.</p>
          )}
          <Button onClick={() => router.push('/categories/all')}>Browse All Products</Button>
        </div>
      ) : (
        !isLoading &&
        !errorMessage && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )
      )}
    </div>
  );
}