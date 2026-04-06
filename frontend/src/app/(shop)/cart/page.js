"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useContext } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	Minus,
	Plus,
	ShoppingBag,
	ShieldCheck,
	Trash2,
	Tag,
	Package,
	Loader2,
	AlertTriangle
} from "lucide-react";

import { CartContext } from "@/context/CartContext";
import { formatPrice } from "@/lib/data";
import { Button } from "@/components/ui/Button";

const CHECKOUT_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function CartPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const { cart, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
	const [isValidatingCart, setIsValidatingCart] = React.useState(false);
	const [unavailableItemsMap, setUnavailableItemsMap] = React.useState({});
	const [availabilityMessage, setAvailabilityMessage] = React.useState("");

	const checkoutItems = React.useMemo(
		() =>
			cart
				.map((item) => ({
					productId: String(item.id || "").trim(),
					quantity: Number(item.qty || 0)
				}))
				.filter((item) => item.productId && Number.isInteger(item.quantity) && item.quantity > 0),
		[cart]
	);

	React.useEffect(() => {
		function getUnavailableItemReasonText(unavailableItem) {
			if (!unavailableItem) return "This item is unavailable";

			if (unavailableItem.reason === "INSUFFICIENT_STOCK") {
				const available = Number(unavailableItem.availableQuantity || 0);
				return available > 0
					? `Only ${available} left in stock`
					: "Out of stock";
			}

			if (unavailableItem.reason === "INACTIVE") {
				return "This product is inactive";
			}

			if (unavailableItem.reason === "NOT_FOUND") {
				return "This product is no longer available";
			}

			return "This item is unavailable";
		}

		async function validateCartItems() {
			if (!session?.accessToken || checkoutItems.length === 0) {
				setUnavailableItemsMap({});
				setAvailabilityMessage("");
				return;
			}

			try {
				setIsValidatingCart(true);
				setAvailabilityMessage("");

				const response = await fetch(`${CHECKOUT_API_BASE}/api/orders/checkout-summary`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${session.accessToken}`
					},
					body: JSON.stringify({
						orderType: "PICKUP",
						items: checkoutItems
					})
				});

				const data = await response.json();
				if (!response.ok) {
					if (data?.code === "ITEMS_UNAVAILABLE" && Array.isArray(data?.unavailableItems)) {
						const nextMap = {};
						for (const unavailableItem of data.unavailableItems) {
							const productId = String(unavailableItem?.productId || "").trim();
							if (!productId) continue;
							nextMap[productId] = {
								reason: unavailableItem.reason,
								message: getUnavailableItemReasonText(unavailableItem)
							};
						}

						setUnavailableItemsMap(nextMap);
						setAvailabilityMessage("Some items in your cart are unavailable. Remove them to continue.");
						return;
					}

					setUnavailableItemsMap({});
					setAvailabilityMessage("");
					return;
				}

				setUnavailableItemsMap({});
				setAvailabilityMessage("");
			} catch (_error) {
				setUnavailableItemsMap({});
				setAvailabilityMessage("");
			} finally {
				setIsValidatingCart(false);
			}
		}

		validateCartItems();
	}, [session, checkoutItems]);

	if (cart.length === 0) {
		return (
			<div className="max-w-6xl mx-auto px-4 py-24 text-center">
				<div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<ShoppingBag size={48} className="text-stone-300" />
				</div>
				<h1 className="text-3xl font-black text-stone-800 mb-3">Your cart is empty</h1>
				<p className="text-stone-500 mb-8">Add products to your cart to review all details before checkout.</p>
				<Button size="lg" onClick={() => router.push("/products")}>Browse Products</Button>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
			<div className="mb-8">
				<h1 className="text-3xl font-black text-stone-800">Your Cart</h1>
				<p className="text-stone-500 text-sm mt-1">Review item details and adjust quantities before checkout.</p>
			</div>

			<div className="grid lg:grid-cols-3 gap-8">
				<section className="lg:col-span-2 rounded-3xl border border-stone-200 bg-white shadow-sm p-5 md:p-7">
					{availabilityMessage && (
						<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
							<AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
							{availabilityMessage}
						</div>
					)}

					{isValidatingCart && (
						<div className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 flex items-center gap-2">
							<Loader2 size={16} className="animate-spin" />
							Checking item availability...
						</div>
					)}

					<div className="flex items-center justify-between mb-5">
						<p className="text-sm text-stone-600">{cartCount} items in cart</p>
						<button
							type="button"
							onClick={clearCart}
							className="text-sm text-red-700 hover:text-red-800 font-medium"
						>
							Clear cart
						</button>
					</div>

					<div className="space-y-3.5">
						{cart.map((item) => {
							const unitPrice = Number(item.discountedPrice || item.price || 0);
							const originalPrice = Number(item.price || 0);
							const lineTotal = unitPrice * Number(item.qty || 0);
							const hasDiscount = Number(item.discountedPrice || 0) > 0 && unitPrice < originalPrice;
							const unavailableItem = unavailableItemsMap[String(item.id)] || null;
							const isUnavailable = Boolean(unavailableItem);

							return (
								<article key={item.id} className={`rounded-xl border p-3.5 sm:p-4 ${isUnavailable ? "border-red-200 bg-red-50/40" : "border-stone-200"}`}>
									<div className="flex gap-3">
										<button
											type="button"
											onClick={() => item.slug && router.push(`/products/${item.slug}`)}
											className="h-20 w-20 sm:h-22 sm:w-22 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 flex-shrink-0"
										>
											<img src={item.image || ""} alt={item.name} className="h-full w-full object-cover" />
										</button>

										<div className="flex-1 min-w-0">
											<button
												type="button"
												onClick={() => item.slug && router.push(`/products/${item.slug}`)}
												className="text-left text-base font-semibold text-stone-800 hover:text-red-800 transition-colors line-clamp-2 leading-snug"
											>
												{item.name}
											</button>

											<div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-500">
												<p className="inline-flex items-center gap-1">
													<Package size={12} />
													{item.weight || "Standard unit"}
												</p>
												{hasDiscount && (
													<p className="inline-flex items-center gap-1 text-emerald-700">
														<Tag size={12} />
														Discount applied
													</p>
												)}
											</div>

											{isUnavailable && (
												<p className="mt-1.5 text-xs font-medium text-red-700">{unavailableItem.message}</p>
											)}

											<div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
												<div>
													<p className="text-xs text-stone-500">Unit Price</p>
													<div className="flex items-center gap-2">
														<p className="text-sm font-semibold text-stone-900">{formatPrice(unitPrice)}</p>
														{hasDiscount && (
															<p className="text-[11px] text-stone-400 line-through">{formatPrice(originalPrice)}</p>
														)}
													</div>
												</div>

												<div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
													<button
														type="button"
														onClick={() => updateQuantity(item.id, -1)}
														disabled={item.qty <= 1}
														className="px-2.5 py-1.5 text-stone-600 hover:text-red-800 hover:bg-stone-50 disabled:opacity-40"
													>
														<Minus size={14} />
													</button>
													<span className="px-3 py-1.5 text-sm font-semibold text-stone-900 min-w-[2.5rem] text-center">
														{item.qty}
													</span>
													<button
														type="button"
														onClick={() => updateQuantity(item.id, 1)}
														disabled={isUnavailable}
														className="px-2.5 py-1.5 text-stone-600 hover:text-red-800 hover:bg-stone-50 disabled:opacity-40"
													>
														<Plus size={14} />
													</button>
												</div>
											</div>

											<div className="mt-2.5 flex items-center justify-between">
												<button
													type="button"
													onClick={() => removeFromCart(item.id)}
													className="inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-800"
												>
													<Trash2 size={14} /> Remove
												</button>
												<p className="text-base font-black text-red-800">{formatPrice(lineTotal)}</p>
											</div>
										</div>
									</div>
								</article>
							);
						})}
					</div>
				</section>

				<aside className="lg:col-span-1">
					<div className="rounded-3xl border border-stone-200 bg-stone-50 p-6 md:p-7 shadow-sm lg:sticky lg:top-28">
						<h2 className="text-xl font-bold text-stone-800 mb-5">Cart Summary</h2>

						<div className="space-y-3 text-sm">
							<div className="flex justify-between text-stone-600">
								<span>Items</span>
								<span>{cartCount}</span>
							</div>
							<div className="flex justify-between text-stone-600">
								<span>Subtotal</span>
								<span>{formatPrice(cartTotal)}</span>
							</div>
							<div className="flex justify-between text-stone-900 text-lg font-black pt-3 border-t border-stone-200">
								<span>Total</span>
								<span className="text-red-800">{formatPrice(cartTotal)}</span>
							</div>
						</div>

						<div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900 inline-flex gap-2">
							<ShieldCheck size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
							Prices include tax. Delivery fee is calculated during checkout if delivery is selected.
						</div>

						<div className="mt-6 space-y-3">
							<Button
								size="lg"
								disabled={isValidatingCart || Object.keys(unavailableItemsMap).length > 0}
								className="w-full"
								onClick={() => router.push("/checkout")}
							>
								Proceed to Checkout
							</Button>
							<button
								type="button"
								onClick={() => router.push("/products")}
								className="w-full text-sm text-stone-600 hover:text-stone-800"
							>
								Continue Shopping
							</button>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
