"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Leaf, Loader2, MapPin, ShieldCheck } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const FALLBACK_HERO = [
  {
    id: "fallback-1",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=2000",
    title: "Authentic Flavors from the Himalayas",
    subtitle:
      "Discover premium Asian groceries, aromatic basmati rice, and handpicked spices in one place."
  }
];

const HOME_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const mapProduct = (product) => {
  const price = Number(product?.price || 0);
  const salePrice = product?.salePrice == null ? null : Number(product.salePrice);

  return {
    id: product?.id,
    slug: product?.slug,
    name: product?.name || "Product",
    image: Array.isArray(product?.images) && product.images[0] ? product.images[0] : "",
    price,
    salePrice,
    categoryName: product?.category?.name || "",
    weight: `${product?.quantity || 1}${product?.unit || "kg"}`,
    rating: null,
    stock: Number(product?.stock || 0)
  };
};

export default function HomePage() {
  const router = useRouter();

  const [homeData, setHomeData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    let isCancelled = false;

    async function loadHomeData() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(`${HOME_API_BASE}/api/home`, {
          method: "GET",
          cache: "no-store"
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load home data");
        }

        if (!isCancelled) {
          setHomeData(payload);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(String(error?.message || "Failed to load home data"));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const heroSlides =
    Array.isArray(homeData?.heroSlides) && homeData.heroSlides.length > 0
      ? homeData.heroSlides
      : FALLBACK_HERO;

  const popularCategories = Array.isArray(homeData?.popularCategories) ? homeData.popularCategories : [];
  const discountedProducts = Array.isArray(homeData?.discountedProducts)
    ? homeData.discountedProducts.map(mapProduct)
    : [];
  const featuredProducts = Array.isArray(homeData?.featuredProducts)
    ? homeData.featuredProducts.map(mapProduct)
    : [];
  const newItems = Array.isArray(homeData?.newItems) ? homeData.newItems.map(mapProduct) : [];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="animate-in fade-in duration-500">
      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div className="relative w-full">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroSlides.map((slide) => (
              <div key={slide.id} className="relative w-full flex-shrink-0">
                <div className="absolute inset-0 z-0">
                  <img
                    src={slide.image}
                    alt={slide.title || "Hero"}
                    className="h-full w-full object-cover opacity-40 mix-blend-overlay"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent" />
                </div>

                <div className="relative z-10 flex min-h-[460px] flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
                  <div className="max-w-2xl">
                    <Badge className="mb-6 inline-flex items-center gap-2 border border-red-500/30 bg-red-800/30 px-3 py-1.5 text-sm text-red-100 backdrop-blur-md">
                      <Leaf size={16} /> 100% Authentic Quality
                    </Badge>
                    <h1 className="mb-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                      {slide.title || "Authentic Groceries"}
                    </h1>
                    <p className="mb-7 max-w-xl text-lg leading-relaxed text-stone-300 sm:text-xl">
                      {slide.subtitle || "Shop premium groceries and staples delivered fast."}
                    </p>
                    {slide.link ? (
                      <Link
                        href={slide.link}
                        className="inline-flex items-center rounded-lg border border-amber-300 bg-amber-400 px-5 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-amber-300"
                      >
                        Explore Offer <ChevronRight size={16} className="ml-1" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {heroSlides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 transition hover:bg-white/40"
              >
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 transition hover:bg-white/40"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 w-2 rounded-full transition ${
                      index === currentSlide ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {isLoading && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-stone-700 shadow-sm">
            <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
            Loading home products and categories...
          </div>
        </section>
      )}

      {!isLoading && errorMessage && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 shadow-sm">
            {errorMessage}
          </div>
        </section>
      )}

      {!isLoading && (
        <>
          <ProductStrip
            title="Offer Products"
            description="Current discounted products selected for you."
            products={discountedProducts}
            emptyMessage="No discounted products yet."
          />

          <section className="bg-[#FDFBF7] py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <h2 className="mb-2 text-3xl font-bold text-stone-800">Popular Categories</h2>
                  <p className="text-stone-500">Featured collections picked by store admins.</p>
                </div>
                <Button variant="ghost" className="hidden sm:flex" onClick={() => router.push("/categories")}>
                  View All <ChevronRight size={18} className="ml-1" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
                {popularCategories.length === 0 && (
                  <p className="col-span-full rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
                    No featured categories yet.
                  </p>
                )}

                {popularCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => router.push("/categories")}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-stone-100 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
                  >
                    <div className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-red-800 to-amber-500 transition-transform duration-300 group-hover:scale-x-100" />
                    <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full sm:h-20 sm:w-20">
                      <img
                        src={category.image || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400"}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-stone-800 transition-colors group-hover:text-red-800">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs text-stone-500">{category._count?.products || 0} products</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <ProductStrip
            title="New Products"
            description="Freshly added products from our catalog."
            products={newItems}
            emptyMessage="No new products yet."
          />

          <ProductStrip
            title="Popular Right Now"
            description="Featured products currently trending in the store."
            products={featuredProducts}
            emptyMessage="No featured products yet."
          />
        </>
      )}

      <section id="features" className="bg-stone-900 py-20 text-stone-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">Why Shop With Us?</h2>
            <p className="text-lg">
              We bring authentic taste to your neighborhood with reliable quality and convenience.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                icon: <Leaf size={32} className="text-amber-400" />,
                title: "Fresh Stock Daily",
                desc: "Our shelves are refreshed frequently for better quality and variety."
              },
              {
                icon: <ShieldCheck size={32} className="text-red-400" />,
                title: "Authentic Sourcing",
                desc: "Products sourced from trusted Himalayan and Asian suppliers."
              },
              {
                icon: <MapPin size={32} className="text-emerald-400" />,
                title: "Easy Pickup Ordering",
                desc: "Reserve online and pick up in-store whenever it suits your schedule."
              }
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-stone-700 bg-stone-800/50 p-8 text-center transition-colors hover:border-stone-600"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-800 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                <p className="leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductStrip({ title, description, products, emptyMessage }) {
  const router = useRouter();

  return (
    <section className="border-t border-stone-100 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-stone-800">{title}</h2>
            <p className="text-stone-500">{description}</p>
          </div>
          <Button variant="ghost" className="hidden sm:flex" onClick={() => router.push("/products")}>
            View All <ChevronRight size={18} className="ml-1" />
          </Button>
        </div>

        {products.length === 0 ? (
          <p className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">{emptyMessage}</p>
        ) : (
          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8">
            {products.map((product) => (
              <div key={product.id} className="w-[260px] min-w-[240px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
