"use client";
import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '@/lib/data';
import { Button } from '@/components/ui/Button';
import ProductCard from '@/components/ProductCard';

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id;
  const [sortBy, setSortBy] = useState('popular');
  
  const category = categoryId === 'all' 
    ? { name: 'All Products', description: 'Browse our complete collection of authentic groceries.' }
    : CATEGORIES.find(c => c.id === categoryId);

  const filteredProducts = useMemo(() => {
    let prods = categoryId === 'all' ? [...PRODUCTS] : PRODUCTS.filter(p => p.categoryId === categoryId);
    
    switch(sortBy) {
      case 'price-low': return prods.sort((a, b) => a.price - b.price);
      case 'price-high': return prods.sort((a, b) => b.price - a.price);
      case 'rating': return prods.sort((a, b) => b.rating - a.rating);
      default: return prods;
    }
  }, [categoryId, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
      <div className="flex items-center text-sm text-stone-500 mb-6">
        <button onClick={() => router.push('/')} className="hover:text-red-800 transition-colors">Home</button>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-stone-800 font-medium">{category?.name}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-stone-100 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-stone-800 mb-3">{category?.name}</h1>
          <p className="text-stone-500 max-w-2xl">{category?.description || `Explore our premium selection of ${category?.name?.toLowerCase()}.`}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-stone-600 flex items-center gap-2">
            <SlidersHorizontal size={16} /> Sort by:
          </label>
          <select 
            className="bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-lg focus:ring-red-800 focus:border-red-800 block p-2.5 outline-none font-medium cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">No products found</h2>
          <Button onClick={() => router.push('/categories/all')}>View All Products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}