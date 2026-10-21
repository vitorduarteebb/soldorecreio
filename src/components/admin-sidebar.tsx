"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin#visao-geral", label: "Visão geral" },
  { href: "/admin#cashback", label: "Cashback padrão" },
  { href: "/admin#clientes", label: "Clientes" },
  { href: "/admin#compras", label: "Lançar compra" },
  { href: "/admin#promocoes", label: "Promoções" },
  { href: "/admin#resgates", label: "Resgates" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  if (pathname !== "/admin") return null;

  return (
    <aside className="hidden w-56 shrink-0 border-r border-stone-200 bg-white lg:block">
      <nav className="sticky top-0 flex flex-col gap-1 p-4" aria-label="Menu do admin">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
          Menu
        </p>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-orange-50 hover:text-orange-800"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/"
          className="mt-4 rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-800"
        >
          ← Site público
        </Link>
      </nav>
    </aside>
  );
}
