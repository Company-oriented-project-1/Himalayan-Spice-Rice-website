"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useCallback, useContext, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Star
} from "lucide-react";

import { CartContext } from "@/context/CartContext";
import { formatPrice } from "@/lib/data";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const PRODUCTS_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { addToCart } = useContext(CartContext);

  const slug = String(params?.id || "").trim();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [reviewSubmitError, setReviewSubmitError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!slug) {
        setErrorMessage("Invalid product link");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(`${PRODUCTS_API_BASE}/api/products/${encodeURIComponent(slug)}`, {
          method: "GET",
          cache: "no-store"
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Failed to fetch product");
        }

        if (!cancelled) {
          setProduct(data);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(String(error?.message || "Failed to fetch product"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const loadReviews = useCallback(async (page = 1, append = false) => {
    if (!slug) return;

    try {
      setIsLoadingReviews(true);
      setReviewsError("");

      const response = await fetch(
        `${PRODUCTS_API_BASE}/api/products/${encodeURIComponent(slug)}/reviews?page=${page}&limit=10`,
        {
          method: "GET",
          cache: "no-store"
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load reviews");
      }

      const incoming = Array.isArray(data?.reviews) ? data.reviews : [];
      setReviews((prev) => (append ? [...prev, ...incoming] : incoming));
      setReviewsPage(Number(data?.pagination?.page || page));
      setReviewsTotalPages(Number(data?.pagination?.totalPages || 1));
    } catch (error) {
      setReviewsError(String(error?.message || "Failed to load reviews"));
    } finally {
      setIsLoadingReviews(false);
    }
  }, [slug]);

  React.useEffect(() => {
    loadReviews(1, false);
  }, [loadReviews]);

  const productPrice = Number(product?.price || 0);
  const salePrice = product?.salePrice == null ? null : Number(product.salePrice);
  const effectivePrice = salePrice ?? productPrice;
  const quantityUnitLabel = `${product?.quantity || 1} ${product?.unit || "kg"}`;
  const isLoggedIn = sessionStatus === "authenticated";

  const image = useMemo(() => {
    if (Array.isArray(product?.images) && product.images[0]) {
      return product.images[0];
    }
    return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=900";
  }, [product]);

  function handleAddToCart() {
    if (!product) return;

    addToCart(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        image,
        price: productPrice,
        salePrice,
        discountedPrice: salePrice,
        weight: `${product.quantity || 1}${product.unit || "kg"}`
      },
      qty
    );
    setQty(1);
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();

    if (!isLoggedIn || !session?.accessToken) {
      setReviewSubmitError("You need to login to review");
      return;
    }

    if (!ratingInput || ratingInput < 1 || ratingInput > 5) {
      setReviewSubmitError("Please select a rating from 1 to 5 stars");
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewSubmitError("");

      const response = await fetch(`${PRODUCTS_API_BASE}/api/products/${encodeURIComponent(slug)}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          rating: ratingInput,
          comment: commentInput
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to add review");
      }

      setRatingInput(0);
      setCommentInput("");
      await loadReviews(1, false);
    } catch (error) {
      setReviewSubmitError(String(error?.message || "Failed to add review"));
    } finally {
      setIsSubmittingReview(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-14 text-center text-stone-700">
        <Loader2 className="mx-auto mb-2 animate-spin" size={22} />
        Loading product details...
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-14">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {errorMessage || "Product not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/products")}
          className="p-2 bg-stone-100 text-stone-600 rounded-full hover:bg-stone-200 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center text-sm text-stone-500">
          <button onClick={() => router.push("/")} className="hover:text-red-800">Home</button>
          <ChevronRight size={14} className="mx-2" />
          <button onClick={() => router.push("/categories")} className="hover:text-red-800">
            {product.category?.name || "Category"}
          </button>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-stone-800 font-medium truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="aspect-square md:aspect-auto md:h-full relative overflow-hidden flex items-center justify-center p-5 sm:p-8">
            <img
              src={image}
              alt={product.name}
              className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="p-5 sm:p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center justify-start mb-3">
                <Badge className="bg-stone-100 text-stone-600">{quantityUnitLabel}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-stone-800 mb-4 leading-tight">{product.name}</h1>
              <div className="mb-1 flex items-baseline gap-3">
                <p className="text-3xl sm:text-4xl font-black text-red-800">{formatPrice(effectivePrice)}</p>
                {salePrice != null && (
                  <p className="text-lg sm:text-xl font-medium text-stone-400 line-through">{formatPrice(productPrice)}</p>
                )}
              </div>
              {/* <p className="text-xs sm:text-sm text-stone-500">per {quantityUnitLabel}</p> */}
            </div>

            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-8 space-y-5">
              <div className="flex items-center justify-center sm:justify-start">
                <div className="flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="p-3 text-stone-500 hover:text-red-800 hover:bg-stone-50 transition-colors"
                    disabled={qty <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-lg text-stone-800">{qty}</span>
                  <button
                    onClick={() => setQty((prev) => prev + 1)}
                    className="p-3 text-stone-500 hover:text-red-800 hover:bg-stone-50 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <Button size="lg" className="w-full text-lg py-4 shadow-xl shadow-red-800/20" onClick={handleAddToCart}>
                <ShoppingBag size={20} className="mr-2" /> Add to Cart - {formatPrice(effectivePrice * qty)}
              </Button>

             
            </div>

            <div>
              <div className="flex border-b border-stone-200 mb-4">
                <button
                  className={`pb-3 px-1 mr-6 font-bold text-sm transition-colors border-b-2 ${activeTab === "desc" ? "border-red-800 text-red-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}
                  onClick={() => setActiveTab("desc")}
                >
                  Description
                </button>
                <button
                  className={`pb-3 px-1 font-bold text-sm transition-colors border-b-2 ${activeTab === "details" ? "border-red-800 text-red-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}
                  onClick={() => setActiveTab("details")}
                >
                  Details & Specs
                </button>
              </div>

              <div className="text-stone-600 text-base leading-relaxed animate-in fade-in duration-300">
                {activeTab === "desc" ? (
                  <p>{product.description || "No description available yet."}</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between border-b border-stone-100 pb-2">
                      <span className="font-medium text-stone-500">Weight</span>
                      <span className="font-bold text-stone-800">{quantityUnitLabel}</span>
                    </li>
                    <li className="flex justify-between border-b border-stone-100 pb-2">
                      <span className="font-medium text-stone-500">Category</span>
                      <span className="font-bold text-stone-800">{product.category?.name || "-"}</span>
                    </li>
                    <li className="flex justify-between border-b border-stone-100 pb-2">
                      <span className="font-medium text-stone-500">SKU</span>
                      <span className="font-bold text-stone-800">{product.productCode || `HSR-${String(product.id).slice(0, 8).toUpperCase()}`}</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-6 sm:mt-8 rounded-3xl border border-stone-100 bg-white p-5 sm:p-7 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Reviews</h2>

        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
          {sessionStatus === "loading" ? (
            <p className="text-sm text-stone-600">Checking login status...</p>
          ) : !isLoggedIn ? (
            <p className="text-sm text-amber-800">You need to login to review.</p>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <p className="mb-2 text-sm font-medium text-stone-700">Your Rating *</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="p-1"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        size={22}
                        className={
                          star <= ratingInput
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Comment (optional)</label>
                <textarea
                  value={commentInput}
                  onChange={(event) => setCommentInput(event.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  placeholder="Share your experience with this product"
                />
              </div>

              {reviewSubmitError && (
                <p className="text-sm text-red-700">{reviewSubmitError}</p>
              )}

              <Button type="submit" disabled={isSubmittingReview}>
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-5 space-y-3">
          {isLoadingReviews && reviews.length === 0 && (
            <p className="text-sm text-stone-600">Loading reviews...</p>
          )}

          {reviewsError && (
            <p className="text-sm text-red-700">{reviewsError}</p>
          )}

          {!isLoadingReviews && !reviewsError && reviews.length === 0 && (
            <p className="text-sm text-stone-600">No reviews yet. Be the first to review.</p>
          )}

          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-stone-900">{review.user?.name || "Customer"}</p>
                <p className="text-xs text-stone-500">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mt-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={`${review.id}-${star}`}
                    size={16}
                    className={star <= review.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}
                  />
                ))}
              </div>
              {review.comment ? (
                <p className="mt-2 text-sm text-stone-700 whitespace-pre-line">{review.comment}</p>
              ) : (
                <p className="mt-2 text-sm text-stone-500">No comment.</p>
              )}
            </article>
          ))}

          {reviewsPage < reviewsTotalPages && (
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => loadReviews(reviewsPage + 1, true)}
                disabled={isLoadingReviews}
              >
                {isLoadingReviews ? "Loading..." : "See More Reviews"}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
