import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";

export default function Home() {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold tracking-tight text-stone-900">
            Sol do Recreio
          </span>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-stone-600 transition hover:bg-stone-100"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-orange-700"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-orange-100/80 via-amber-50/40 to-transparent" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-4 py-14 md:py-20">
          <section className="space-y-5 text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-700">
              Programa de fidelidade
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-stone-900 md:text-5xl lg:text-[3.25rem] lg:leading-tight">
              Compre no Sol do Recreio e receba cashback para resgatar.
            </h1>
            <p className="mx-auto max-w-2xl text-pretty text-lg text-stone-600 md:mx-0">
              Cada compra registrada pela equipe acumula percentual em cashback. Você
              acompanha o saldo, recebe avisos de promoções e solicita o resgate — o
              mercado confirma tudo no painel.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start">
              <Link
                href="/register"
                className="inline-flex rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-orange-700"
              >
                Quero participar
              </Link>
              <Link
                href="/login"
                className="inline-flex rounded-xl border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 shadow-sm transition hover:bg-stone-50"
              >
                Já sou cliente
              </Link>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Saldo claro",
                text: "Veja quanto cashback você tem para resgatar.",
              },
              {
                title: "Promoções",
                text: "Receba avisos de ofertas direto no app.",
              },
              {
                title: "Resgate simples",
                text: "Peça o resgate; a equipe aprova no caixa.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md"
              >
                <h2 className="font-semibold text-stone-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {item.text}
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-stone-900">Equipe do mercado</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Painel para clientes cadastrados, lançamento de compras com cashback
                automático, promoções com notificação e gestão de pedidos de resgate.
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-stone-900">Clientes</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Cadastro com WhatsApp, acesso por e-mail ou Google, saldo em tempo
                real e histórico de compras e resgates.
              </p>
            </div>
          </section>

          {isDev && (
            <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50/80 px-4 py-3 text-center text-sm text-amber-900">
              Modo desenvolvimento — rode{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
                npm run db:seed
              </code>{" "}
              para contas de teste (veja README).
            </p>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
