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

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-stone-900">Sol do Recreio</span>
            <Link href="/cliente" className="text-sm text-orange-700 hover:underline">
              Meu cashback
            </Link>
          </div>
          <SignOutButton />
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
