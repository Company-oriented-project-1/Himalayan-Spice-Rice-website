"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/data';

export default function CategoriesPage() {
  const router = useRouter();

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map(category => (
          <div 
            key={category.id}
            onClick={() => router.push(`/categories/${category.id}`)}
            className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
          >
            <div className="h-48 w-full relative overflow-hidden bg-stone-100">
              <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
              <img src={category.image} alt={category.name} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="p-6 relative bg-white">
              <div className="absolute -top-8 right-6 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-3xl z-20">
                {category.icon}
              </div>
              <h3 className="font-bold text-xl text-stone-800 group-hover:text-red-800 transition-colors mb-2">{category.name}</h3>
              <p className="text-stone-500 text-sm">Explore premium {category.name.toLowerCase()} & more.</p>
              <div className="mt-4 text-red-800 font-medium text-sm flex items-center group-hover:translate-x-2 transition-transform">
                Browse category <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}