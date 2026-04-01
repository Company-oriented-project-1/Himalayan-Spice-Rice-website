"use client";

import React from "react";
import { Loader2 } from "lucide-react";

import ProductCard from "@/components/ProductCard";

const PRODUCTS_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const mapProduct = (product) => ({
	id: product?.id,
	slug: product?.slug,
	name: product?.name || "Product",
	image: Array.isArray(product?.images) && product.images[0] ? product.images[0] : "",
	price: Number(product?.price || 0),
	salePrice: product?.salePrice == null ? null : Number(product.salePrice),
	quantity: product?.quantity || 1,
	unit: product?.unit || "kg",
	stock: Number(product?.stock || 0),
	rating: null
});

export default function ProductsPage() {
	const [products, setProducts] = React.useState([]);
	const [isLoading, setIsLoading] = React.useState(true);
	const [errorMessage, setErrorMessage] = React.useState("");

	React.useEffect(() => {
		let cancelled = false;

		async function loadProducts() {
			try {
				setIsLoading(true);
				setErrorMessage("");

				const response = await fetch(`${PRODUCTS_API_BASE}/api/products?limit=60`, {
					method: "GET",
					cache: "no-store"
				});
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data?.message || "Failed to fetch products");
				}

				if (!cancelled) {
					const nextProducts = Array.isArray(data?.products) ? data.products.map(mapProduct) : [];
					setProducts(nextProducts);
				}
			} catch (error) {
				if (!cancelled) {
					setErrorMessage(String(error?.message || "Failed to fetch products"));
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadProducts();

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<header className="mb-8">
				<h1 className="text-3xl font-black text-stone-900">All Products</h1>
				<p className="mt-2 text-stone-600">Browse the latest items from our Himalayan grocery collection.</p>
			</header>

			{isLoading && (
				<div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-700 shadow-sm">
					<Loader2 className="mx-auto mb-2 animate-spin" size={20} />
					Loading products...
				</div>
			)}

			{!isLoading && errorMessage && (
				<div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 shadow-sm">
					{errorMessage}
				</div>
			)}

			{!isLoading && !errorMessage && products.length === 0 && (
				<div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700 shadow-sm">
					No products found.
				</div>
			)}

			{!isLoading && !errorMessage && products.length > 0 && (
				<section className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{products.map((product) => (
						<ProductCard key={product.id} product={product} />
					))}
				</section>
			)}
		</div>
	);
}
