import Link from "next/link";
import { signOut } from "@/auth";

async function SignOutButton() {
  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-stone-600 hover:text-stone-900"
      >
        Sair
      </button>
    </form>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-stone-900">Painel do mercado</span>
            <nav className="flex flex-wrap gap-4 text-sm">
              <Link href="/admin" className="text-orange-700 hover:underline">
                Visão geral
              </Link>
            </nav>
          </div>
          <SignOutButton />
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
