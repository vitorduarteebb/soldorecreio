"use client";

import { brl, dateTime } from "@/lib/format";
import { useCallback, useEffect, useState } from "react";

type Summary = {
  user: { name: string; email: string; cashbackBalance: number } | null;
  merchant: { name: string; cashbackPercent: number } | null;
  purchases: {
    id: string;
    amount: number;
    cashbackAmount: number;
    cashbackPercent: number;
    createdAt: string;
    note: string | null;
  }[];
  notifications: {
    id: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
  }[];
  redemptions: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
};

export default function ClientePage() {
  const [data, setData] = useState<Summary | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/cliente/summary");
    if (res.ok) {
      const j = await res.json();
      setData(j);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: string) {
    await fetch("/api/cliente/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function requestRedemption(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const n = parseFloat(amount.replace(",", "."));
    if (Number.isNaN(n) || n <= 0) {
      setError("Informe um valor válido.");
      return;
    }
    const res = await fetch("/api/cliente/redemptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: n }),
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j.error ?? "Não foi possível solicitar.");
      return;
    }
    setMessage(
      "Pedido registrado. A equipe do Sol do Recreio vai analisar; se recusado, o valor volta ao seu saldo.",
    );
    setAmount("");
    load();
  }

  if (!data?.user) {
    return (
      <main className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 px-4 py-24 text-stone-500">
        <span
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-orange-600 border-t-transparent"
          aria-hidden
        />
        Carregando seu cashback…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          Olá, {data.user.name.split(" ")[0]}
        </h1>
        {data.merchant && (
          <p className="mt-1 text-stone-600">
            <span className="font-medium">{data.merchant.name}</span>
            {" — "}
            cashback nas compras: {data.merchant.cashbackPercent}%
          </p>
        )}
      </div>

      <section className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm">
        <h2 className="text-sm font-medium uppercase tracking-wide text-orange-800">
          Saldo para resgate
        </h2>
        <p className="mt-2 text-4xl font-bold text-orange-900">
          {brl(data.user.cashbackBalance)}
        </p>
        <p className="mt-2 text-sm text-stone-600">
          Valor acumulado em compras. Solicite o resgate abaixo; confirmamos no caixa.
        </p>
      </section>

      {(message || error) && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            error ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Solicitar resgate</h2>
        <p className="mt-1 text-sm text-stone-500">
          O valor fica reservado até aprovação ou recusa (se recusado, volta ao saldo).
        </p>
        <form onSubmit={requestRedemption} className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm font-medium text-stone-700">Valor (R$)</label>
            <input
              type="text"
              required
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-40 rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
          >
            Solicitar
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Notificações</h2>
        {data.notifications.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Nenhuma notificação.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.notifications.map((n) => (
              <li
                key={n.id}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  n.read
                    ? "border-stone-100 bg-stone-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex justify-between gap-2">
                  <span className="font-medium text-stone-900">{n.title}</span>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="shrink-0 text-xs text-orange-700 hover:underline"
                    >
                      Marcar lida
                    </button>
                  )}
                </div>
                <p className="mt-1 text-stone-600">{n.body}</p>
                <p className="mt-1 text-xs text-stone-400">{dateTime(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Histórico de compras e cashback</h2>
        {data.purchases.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Ainda não há compras registradas.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.purchases.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap justify-between gap-2 border-b border-stone-100 py-2 text-sm"
              >
                <span className="text-stone-600">{dateTime(p.createdAt)}</span>
                <span>
                  Compra {brl(p.amount)} → cashback{" "}
                  <span className="font-medium text-green-700">{brl(p.cashbackAmount)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Meus pedidos de resgate</h2>
        {data.redemptions.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Nenhum pedido ainda.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.redemptions.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap justify-between gap-2 border-b border-stone-100 py-2 text-sm"
              >
                <span>{dateTime(r.createdAt)}</span>
                <span>{brl(r.amount)}</span>
                <span
                  className={
                    r.status === "PENDING"
                      ? "text-amber-700"
                      : r.status === "APPROVED"
                        ? "text-green-700"
                        : "text-stone-600"
                  }
                >
                  {r.status === "PENDING" && "Pendente"}
                  {r.status === "APPROVED" && "Aprovado"}
                  {r.status === "REJECTED" && "Recusado (valor devolvido)"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
