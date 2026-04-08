import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold text-stone-800">
            Mercado Cashback
          </span>
          <div className="flex gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-stone-600 hover:bg-stone-100"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
            >
              Sou cliente — cadastrar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-16">
        <section className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-orange-600">
            Programa de fidelidade
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
            Compre no mercado, receba cashback para o próximo resgate.
          </h1>
          <p className="max-w-2xl text-lg text-stone-600">
            Clientes filiados acumulam percentual sobre cada compra. O administrador
            registra as compras, lança promoções e acompanha resgates. Simples e
            transparente.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-stone-900">Para o mercado</h2>
            <p className="mt-2 text-sm text-stone-600">
              Painel para clientes, lançamento de compras com cashback automático,
              promoções com notificação aos filiados e fila de resgates.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-stone-900">Para o cliente</h2>
            <p className="mt-2 text-sm text-stone-600">
              Cadastro com código do mercado, saldo de cashback, histórico e
              solicitação de resgate.
            </p>
          </div>
        </section>

        <p className="text-center text-sm text-stone-500">
          Ambiente de demonstração — use o seed para contas de teste após{" "}
          <code className="rounded bg-stone-200 px-1.5 py-0.5">npm run db:seed</code>.
        </p>
      </main>
    </div>
  );
}
