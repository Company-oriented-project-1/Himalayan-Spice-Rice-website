import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/AuthComponents";

export default async function DashboardPage() {
  // Check session on the server
  const session = await getServerSession(authOptions);

  // If no session exists, redirect to login
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
            <p className="text-gray-500">Welcome back, {session.user.name}</p>
          </div>
          <LogoutButton />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-2">Account Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Email:</strong> {session.user.email}</p>
              <p>
                <strong>Role:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                  session.user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {session.user.role}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-2">Recent Activity</h3>
            <p className="text-sm text-gray-500 italic">No recent orders found.</p>
          </div>
        </div>

        {session.user.role === "ADMIN" && (
          <div className="mt-8 bg-orange-50 border border-orange-200 p-6 rounded-xl">
            <h3 className="font-bold text-orange-800 mb-2">Admin Panel Access</h3>
            <p className="text-orange-700 text-sm mb-4">You have administrative privileges. You can manage products and view all orders.</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 transition">
              Go to Admin Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
}