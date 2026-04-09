import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white/90 py-8 text-center text-sm text-stone-500">
      <p>Sol do Recreio — programa de cashback</p>
      <p className="mt-2">
        <Link href="/login" className="text-orange-700 hover:underline">
          Entrar
        </Link>
        {" · "}
        <Link href="/register" className="text-orange-700 hover:underline">
          Cadastro
        </Link>
      </p>
    </footer>
  );
}
