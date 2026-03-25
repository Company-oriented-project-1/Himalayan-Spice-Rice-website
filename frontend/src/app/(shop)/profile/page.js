import { getProfileAction } from "@/lib/actions";
import { redirect } from "next/navigation";
import { User, Mail, Calendar, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function ProfilePage() {
  const { data: user, error } = await getProfileAction();

  // If not logged in or token expired, redirect to login
  if (error || !user) {
    redirect("/login");
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center text-red-800 text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-stone-900">{user.name}</h1>
              <p className="text-stone-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                <ShieldCheck size={16} className="text-green-600" />
                {user.role} Account
              </p>
            </div>
            <div className="md:ml-auto">
              <Button variant="outline" className="rounded-full">
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Account Information */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
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
            </div>
          </div>

          {/* Activity/Status Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
            <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-red-800" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button className="w-full justify-start gap-3 text-stone-600 primary border-none">
                View Order History
              </Button>
              <Button className="w-full justify-start gap-3 text-stone-600 primary border-none">
                Manage Addresses
              </Button>
              <Button className="w-full justify-start gap-3 text-red-600 primary border-none">
                Privacy Settings
              </Button>
            </div>
          </div>

        </div>

        {/* Admin Section (Conditional) */}
        {user.role === 'ADMIN' && (
          <div className="mt-6 bg-red-900 rounded-3xl p-8 shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Admin Dashboard</h2>
                <p className="text-red-200 text-sm">Access store management and inventory tools.</p>
              </div>
              <Button className="bg-white text-red-900 hover:bg-stone-100">
                Go to Admin
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}