"use client";

import Link from "next/link";

const items = [
  { href: "/admin#cashback", label: "Cashback" },
  { href: "/admin#clientes", label: "Clientes" },
  { href: "/admin#compras", label: "Compras" },
  { href: "/admin#promocoes", label: "Promoções" },
  { href: "/admin#resgates", label: "Resgates" },
];

export function AdminMobileNav() {
  return (
    <nav
      className="flex gap-2 overflow-x-auto border-b border-stone-200 bg-white px-4 py-2 lg:hidden"
      aria-label="Menu do admin"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="shrink-0 rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-700 hover:border-orange-300 hover:bg-orange-50"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
