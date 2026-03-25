"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const isActiveLink = (pathname, href) => {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function AdminSidebarNav({ links }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const active = isActiveLink(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
              active
                ? "border-red-300 bg-red-100 text-red-900 shadow-sm"
                : "border-stone-200 bg-stone-50 text-stone-700 hover:border-red-300 hover:bg-red-50 hover:text-red-900"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
