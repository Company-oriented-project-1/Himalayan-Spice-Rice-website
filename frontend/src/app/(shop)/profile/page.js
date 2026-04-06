import Link from "next/link";
import { getMyOrdersAction, getProfileAction } from "@/lib/actions";
import { redirect } from "next/navigation";
import { User, Mail, Calendar, ShieldCheck, Clock, Package, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ProfileEditorCard from "@/components/profile/ProfileEditorCard";
import { formatPrice } from "@/lib/data";

export default async function ProfilePage() {
  const { data: user, error } = await getProfileAction();
  const { data: orders = [] } = await getMyOrdersAction(8);

  // If not logged in or token expired, redirect to login
  if (error || !user) {
    redirect("/login");
  }

  const hasOrders = Array.isArray(orders) && orders.length > 0;
  const deliveredCount = orders.filter((order) => order.status === "DELIVERED").length;
  const recentTotal = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const profileFilled = [user?.name, user?.profile?.phone, user?.profile?.address].filter(Boolean).length;
  const profileCompletion = Math.round((profileFilled / 3) * 100);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center text-red-800 text-3xl font-bold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-stone-900">{user.name}</h1>
              <p className="text-stone-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                <ShieldCheck size={16} className="text-green-600" />
                {user.role} Account
              </p>
              <p className="text-xs text-stone-400 mt-1">Profile completion: {profileCompletion}%</p>
            </div>
            <div className="md:ml-auto">
              <Link
                href="/"
                className="inline-flex items-center justify-center cursor-pointer font-semibold rounded-full transition-all duration-300 active:scale-95 px-5 py-2.5 border-2 border-stone-200 text-stone-700 hover:border-red-800 hover:text-red-800"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-stone-500">Total Orders</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{user?._count?.orders || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-stone-500">Delivered</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{deliveredCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-stone-500">Recent Spend</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{formatPrice(recentTotal)}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Account Information */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 lg:col-span-1">
            <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-red-800" />
              Account Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="text-stone-400 mt-1" size={18} />
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-stone-700 font-medium">{user.email}</p>
                  {user.isVerified ? (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Verified</span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Verification Pending</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="text-stone-400 mt-1" size={18} />
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Member Since</p>
                  <p className="text-stone-700 font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="text-stone-400 mt-1" size={18} />
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Saved Phone</p>
                  <p className="text-stone-700 font-medium">{user.profile?.phone || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="text-stone-400 mt-1" size={18} />
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Saved Address</p>
                  <p className="text-stone-700 font-medium">{user.profile?.address || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity/Status Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 lg:col-span-2">
            <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-red-800" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              {hasOrders ? (
                <a
                  href="#recent-orders"
                  className="w-full inline-flex items-center cursor-pointer font-semibold rounded-xl transition-all duration-300 active:scale-95 px-5 py-2.5 border border-stone-200 bg-stone-50 text-stone-700 hover:border-red-200 hover:bg-red-50 hover:text-red-900 shadow-sm gap-3"
                >
                  View Order History <ArrowRight size={16} className="ml-auto" />
                </a>
              ) : null}
              <a
                href="#edit-profile"
                className="w-full inline-flex items-center cursor-pointer font-semibold rounded-xl transition-all duration-300 active:scale-95 px-5 py-2.5 border border-stone-200 bg-stone-50 text-stone-700 hover:border-red-200 hover:bg-red-50 hover:text-red-900 shadow-sm gap-3"
              >
                Edit Profile & Address <ArrowRight size={16} className="ml-auto" />
              </a>
              <Link
                href="/contact"
                className="w-full inline-flex items-center cursor-pointer font-semibold rounded-xl transition-all duration-300 active:scale-95 px-5 py-2.5 border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 shadow-sm gap-3"
              >
                Need Help? Contact Support <ArrowRight size={16} className="ml-auto" />
              </Link>
            </div>
          </div>

        </div>

        <div id="edit-profile" className="mt-6">
          <ProfileEditorCard initialUser={user} />
        </div>

        {hasOrders && (
          <div id="recent-orders" className="mt-6 bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900">Recent Order History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wide text-xs">
                  <tr>
                    <th className="text-left px-6 py-3">Order</th>
                    <th className="text-left px-6 py-3">Type</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Date</th>
                    <th className="text-right px-6 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-3 font-semibold text-stone-800">{order.orderNumber}</td>
                      <td className="px-6 py-3 text-stone-600">{order.orderType}</td>
                      <td className="px-6 py-3 text-stone-600">{order.status}</td>
                      <td className="px-6 py-3 text-stone-600">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-3 text-right text-stone-900 font-semibold">{formatPrice(Number(order.totalAmount || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin Section (Conditional) */}
        {user.role === 'ADMIN' && (
          <div className="mt-6 bg-red-800 rounded-3xl p-8 shadow-lg text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Admin Dashboard</h2>
                <p className="text-red-200 text-sm">Access store management and inventory tools.</p>
              </div>
              <form action="/admin" method="get">
                <Button type="submit" variant="primary" className="whitespace-nowrap border-none">
                  Go to Admin
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}