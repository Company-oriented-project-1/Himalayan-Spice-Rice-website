import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteAdminUserAction, getAdminUsersAction } from "@/lib/actions";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";

export default async function AdminUsersPage({ searchParams }) {
  const page = Number(searchParams?.page || "1");
  const limit = Number(searchParams?.limit || "10");
  const search = searchParams?.search || "";
  const role = searchParams?.role || "";
  const isVerifiedParam = searchParams?.isVerified;

  const isVerified =
    isVerifiedParam === "true" ? true : isVerifiedParam === "false" ? false : undefined;

  const usersResult = await getAdminUsersAction({
    page: Number.isNaN(page) ? 1 : page,
    limit: Number.isNaN(limit) ? 10 : limit,
    search,
    role,
    isVerified
  });

  const users = usersResult?.data?.users || [];
  const pagination = usersResult?.data?.pagination || { page: 1, totalPages: 1 };

  async function deleteUserFormAction(formData) {
    "use server";
    const userId = String(formData.get("userId") || "");
    if (!userId) return;

    await deleteAdminUserAction(userId);
    redirect("/admin/users");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-red-800">Admin Module</p>
          <h2 className="font-title mt-2 text-3xl font-bold text-stone-900">Users</h2>
          <p className="mt-2 text-stone-600">Search, view, edit, and remove users.</p>
        </div>
        <Link
          href="/admin/users/create"
          className="inline-flex items-center rounded-lg border border-red-300 bg-red-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Create User
        </Link>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-4" method="GET">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or email"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none ring-red-200 focus:ring"
          />
          <select
            name="role"
            defaultValue={role}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none ring-red-200 focus:ring"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>
          <select
            name="isVerified"
            defaultValue={isVerifiedParam || ""}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none ring-red-200 focus:ring"
          >
            <option value="">All Verification Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-stone-300 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200"
          >
            Apply Filters
          </button>
        </form>
      </section>

      {usersResult?.error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 break-words">
          {usersResult.error}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Verified</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                    No users found.
                  </td>
                </tr>
              )}

              {users.map((user) => (
                <tr key={user.id} className="border-t border-stone-200">
                  <td className="px-4 py-3 font-medium text-stone-900">{user.name || "-"}</td>
                  <td className="px-4 py-3 text-stone-700">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        user.isVerified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {user.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="rounded-md border border-blue-300 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </Link>
                      <form action={deleteUserFormAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <ConfirmDeleteButton
                          userName={user.name || user.email}
                          label="Delete"
                          className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-stone-600">
          Page {pagination.page} of {pagination.totalPages || 1}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/admin/users?page=${Math.max(1, Number(pagination.page || 1) - 1)}&limit=${limit}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Previous
          </Link>
          <Link
            href={`/admin/users?page=${Math.min(Number(pagination.totalPages || 1), Number(pagination.page || 1) + 1)}&limit=${limit}`}
            className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Next
          </Link>
        </div>
      </section>
    </div>
  );
}
