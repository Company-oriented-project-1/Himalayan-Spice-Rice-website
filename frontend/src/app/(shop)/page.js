"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, ChevronRight, ShieldCheck, MapPin } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '@/lib/data';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const router = useRouter();
  const heroData = [
    {
    id: 1,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=2000",
    title: "Authentic Flavors from the Himalayas",
    description: "Discover premium Asian groceries, aromatic basmati rice, and handpicked spices — all in one place."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=2000",
    title: "Quality You Can Trust, Prices You’ll Love",
    description: "Shop top-quality groceries at affordable prices with exclusive deals every day."
  },
  {
  id: 3,
  image: "https://images.pexels.com/photos/7363072/pexels-photo-7363072.jpeg?auto=compress&cs=tinysrgb&w=2000",
  title: "Fast Delivery or Easy Store Pickup",
  description: "Order online and get fresh groceries delivered to your doorstep or pick them up conveniently at our store."
}

  ];

  const [currentSlide, setCurrentSlide] = React.useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroData.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroData.length) % heroData.length);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section Carousel */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        <div className="relative w-full">
          <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {heroData.map((slide) => (
              <div key={slide.id} className="w-full flex-shrink-0 relative">
                <div className="absolute inset-0 z-0">
                  <img 
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent"></div>
                </div>
                
                <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col justify-center min-h-[500px]">
                  <div className="max-w-2xl">
                    <Badge className="bg-red-800/30 text-red-100 backdrop-blur-md border border-red-500/30 mb-6 inline-flex items-center gap-2 px-3 py-1.5 text-sm">
                      <Leaf size={16} /> 100% Authentic Quality
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                      {slide.title.split(" ").map((word, i) => 
                        (word === "Himalayas," || word === "Himalayas") ? 
                        <span key={i} className="text-amber-400">{word} </span> : 
                        <span key={i}>{word} </span>
                      )}
                    </h1>
                    <p className="text-lg sm:text-xl text-stone-300 mb-8 max-w-xl leading-relaxed">
                      {slide.description}
                    </p>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 p-2 rounded-full transition">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 p-2 rounded-full transition">
            <ChevronRight size={24} />
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroData.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition ${i === currentSlide ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        </div>
      </section>

       {/* Featured Products Carousel */}
      <section className="py-16 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-stone-800 mb-2">Offer Products</h2>
            </div>
            <Button variant="ghost" className="hidden sm:flex" onClick={() => router.push('/categories')}>
              View All <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>

          <div className="relative">
            {/* Carousel Container */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {PRODUCTS.slice(0, 6).map(product => (
                <div key={product.id} className="min-w-[180px] sm:min-w-[200px] w-[180px] sm:w-[280px] snap-start flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {/* Custom fade edges for carousel visual cue */}
            <div className="absolute top-0 right-0 bottom-8 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none hidden md:block"></div>
          </div>
          
          <div className="mt-4 sm:hidden text-center">
            <Button variant="outline" className="w-full" onClick={() => router.push('/categories')}>
              View All Products
            </Button>
          </div>
        </div>
      </section>

            {/* New Products Carousel */}
      <section className="py-16 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-stone-800 mb-2">New Products</h2>
            </div>
            <Button variant="ghost" className="hidden sm:flex" onClick={() => router.push('/categories')}>
              View All <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>

          <div className="relative">
            {/* Carousel Container */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {PRODUCTS.slice(0, 6).map(product => (
                <div key={product.id} className="min-w-[260px] sm:min-w-[280px] w-[280px] snap-start flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {/* Custom fade edges for carousel visual cue */}
            <div className="absolute top-0 right-0 bottom-8 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none hidden md:block"></div>
          </div>
          
          <div className="mt-4 sm:hidden text-center">
            <Button variant="outline" className="w-full" onClick={() => router.push('/categories')}>
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-stone-800 mb-2">Shop by Category</h2>
              <p className="text-stone-500">Find exactly what you need for your next meal.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {CATEGORIES.map(category => (
              <div 
                key={category.id}
                onClick={() => router.push(`/categories/${category.id}`)}
                className="group cursor-pointer bg-white rounded-2xl p-4 sm:p-6 text-center border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-800 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-stone-50 rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-bold text-stone-800 group-hover:text-red-800 transition-colors">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-16 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-stone-800 mb-2">Popular Right Now</h2>
              <p className="text-stone-500">Handpicked favorites loved by our customers.</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex" onClick={() => router.push('/categories')}>
              View All <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>

          <div className="relative">
            {/* Carousel Container */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {PRODUCTS.slice(0, 6).map(product => (
                <div key={product.id} className="min-w-[260px] sm:min-w-[280px] w-[280px] snap-start flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {/* Custom fade edges for carousel visual cue */}
            <div className="absolute top-0 right-0 bottom-8 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none hidden md:block"></div>
          </div>
          
          <div className="mt-4 sm:hidden text-center">
            <Button variant="outline" className="w-full" onClick={() => router.push('/categories')}>
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="features" className="py-20 bg-stone-900 text-stone-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Why Shop With Us?</h2>
            <p className="text-lg">We bring the authentic taste of home right to your neighborhood with premium quality and unmatched convenience.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: <Leaf size={32} className="text-amber-400" />, title: "Fresh Stock Daily", desc: "We ensure our shelves are always stocked with the freshest ingredients." },
              { icon: <ShieldCheck size={32} className="text-red-400" />, title: "Authentic Sourcing", desc: "Products sourced directly from trusted Himalayan and Asian suppliers." },
              { icon: <MapPin size={32} className="text-emerald-400" />, title: "Easy Pickup Ordering", desc: "Reserve your cart online and pick it up at your convenience. No online payment needed." },
            ].map((feature, i) => (
              <div key={i} className="bg-stone-800/50 p-8 rounded-2xl border border-stone-700 hover:border-stone-600 transition-colors text-center">
                <div className="w-16 h-16 mx-auto bg-stone-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}