import Link from "next/link";
import { signOut } from "@/auth";
import { AdminMobileNav } from "@/components/admin-mobile-nav";
import { AdminSidebar } from "@/components/admin-sidebar";

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
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin" className="font-semibold text-stone-900">
            Sol do Recreio — Admin
          </Link>
          <SignOutButton />
        </div>
      </header>
      <AdminMobileNav />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
