"use client";

import { brl, dateTime } from "@/lib/format";
import { useCallback, useEffect, useState } from "react";

type Customer = {
  id: string;
  email: string;
  name: string;
  cashbackBalance: number;
  createdAt: string;
};

type Promotion = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

type Redemption = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
};

export default function AdminPage() {
  const [merchant, setMerchant] = useState<{
    name: string;
    cashbackPercent: number;
  } | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [pctInput, setPctInput] = useState("");
  const [purchaseEmail, setPurchaseEmail] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [purchaseNote, setPurchaseNote] = useState("");
  const [promoTitle, setPromoTitle] = useState("");
  const [promoBody, setPromoBody] = useState("");
  const [notifyCustomers, setNotifyCustomers] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [s, c, p, r] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/customers"),
        fetch("/api/admin/promotions"),
        fetch("/api/admin/redemptions"),
      ]);
      if (s.ok) {
        const j = await s.json();
        setMerchant(j.merchant);
        setPctInput(String(j.merchant?.cashbackPercent ?? 5));
      }
      if (c.ok) {
        const j = await c.json();
        setCustomers(j.customers ?? []);
      }
      if (p.ok) {
        const j = await p.json();
        setPromotions(j.promotions ?? []);
      }
      if (r.ok) {
        const j = await r.json();
        setRedemptions(j.redemptions ?? []);
      }
    } catch {
      setError("Falha ao carregar dados.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function savePercent() {
    setMessage(null);
    setError(null);
    const n = parseFloat(pctInput.replace(",", "."));
    if (Number.isNaN(n) || n < 0 || n > 100) {
      setError("Percentual inválido.");
      return;
    }
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cashbackPercent: n }),
    });
    if (!res.ok) {
      setError("Não foi possível salvar.");
      return;
    }
    setMessage("Percentual de cashback atualizado.");
    load();
  }

  async function submitPurchase(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const amount = parseFloat(purchaseAmount.replace(",", "."));
    if (Number.isNaN(amount) || amount <= 0) {
      setError("Valor da compra inválido.");
      return;
    }
    const res = await fetch("/api/admin/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerEmail: purchaseEmail.trim(),
        amount,
        note: purchaseNote || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erro ao registrar.");
      return;
    }
    setMessage(
      `Compra registrada. Cashback creditado: ${brl(data.cashbackAmount)} (${data.cashbackPercent}%).`,
    );
    setPurchaseAmount("");
    setPurchaseNote("");
    load();
  }

  async function submitPromotion(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: promoTitle,
        body: promoBody,
        notifyCustomers,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erro ao criar promoção.");
      return;
    }
    setMessage(
      notifyCustomers
        ? "Promoção criada e clientes notificados."
        : "Promoção criada.",
    );
    setPromoTitle("");
    setPromoBody("");
    load();
  }

  async function handleRedemption(id: string, action: "APPROVE" | "REJECT") {
    setMessage(null);
    setError(null);
    const res = await fetch("/api/admin/redemptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro.");
      return;
    }
    setMessage(action === "APPROVE" ? "Resgate aprovado." : "Resgate recusado — saldo devolvido ao cliente.");
    load();
  }

  const pendingRedemptions = redemptions.filter((x) => x.status === "PENDING");

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Painel — Sol do Recreio</h1>
        {merchant && (
          <p className="mt-1 text-stone-600">
            <span className="font-medium text-stone-800">{merchant.name}</span>
          </p>
        )}
      </div>

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
        <h2 className="text-lg font-semibold text-stone-900">Cashback padrão</h2>
        <p className="mt-1 text-sm text-stone-500">
          Percentual aplicado sobre o valor de cada compra lançada (pode alterar quando quiser).
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm font-medium text-stone-700">% sobre a compra</label>
            <input
              type="text"
              value={pctInput}
              onChange={(e) => setPctInput(e.target.value)}
              className="mt-1 w-32 rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <button
            type="button"
            onClick={savePercent}
            className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-900"
          >
            Salvar
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Clientes cadastrados</h2>
        <p className="mt-1 text-sm text-stone-500">
          {customers.length} cliente(s) cadastrado(s).
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-2 pr-4 font-medium">Nome</th>
                <th className="pb-2 pr-4 font-medium">E-mail</th>
                <th className="pb-2 font-medium">Saldo cashback</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-stone-100">
                  <td className="py-2 pr-4">{c.name}</td>
                  <td className="py-2 pr-4 text-stone-600">{c.email}</td>
                  <td className="py-2 font-medium text-green-700">{brl(c.cashbackBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Lançar compra</h2>
        <p className="mt-1 text-sm text-stone-500">
          Informe o e-mail do cliente e o valor — o cashback é calculado e creditado automaticamente.
        </p>
        <form onSubmit={submitPurchase} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-stone-700">E-mail do cliente</label>
            <input
              type="email"
              required
              value={purchaseEmail}
              onChange={(e) => setPurchaseEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Valor da compra (R$)</label>
            <input
              type="text"
              required
              placeholder="120,50"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Observação (opcional)</label>
            <input
              type="text"
              value={purchaseNote}
              onChange={(e) => setPurchaseNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
            >
              Registrar compra e creditar cashback
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Promoções</h2>
        <p className="mt-1 text-sm text-stone-500">
          Crie ofertas e avise todos os clientes cadastrados na hora.
        </p>
        <form onSubmit={submitPromotion} className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-stone-700">Título</label>
            <input
              required
              value={promoTitle}
              onChange={(e) => setPromoTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Mensagem</label>
            <textarea
              required
              rows={3}
              value={promoBody}
              onChange={(e) => setPromoBody(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={notifyCustomers}
              onChange={(e) => setNotifyCustomers(e.target.checked)}
            />
            Notificar todos os clientes
          </label>
          <button
            type="submit"
            className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
          >
            Publicar promoção
          </button>
        </form>
        <ul className="mt-6 space-y-2 border-t border-stone-100 pt-4">
          {promotions.map((p) => (
            <li key={p.id} className="rounded-lg bg-stone-50 px-3 py-2 text-sm">
              <span className="font-medium text-stone-900">{p.title}</span>
              <span className="text-stone-400"> — {dateTime(p.createdAt)}</span>
              <p className="mt-1 text-stone-600">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Resgates de cashback</h2>
        <p className="mt-1 text-sm text-stone-500">
          Clientes pedem resgate aqui; ao aprovar, confirme no caixa. Ao recusar, o valor volta ao saldo do cliente.
        </p>
        {pendingRedemptions.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">Nenhum pedido pendente.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pendingRedemptions.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-stone-900">{r.user.name}</p>
                  <p className="text-sm text-stone-600">{r.user.email}</p>
                  <p className="mt-1 text-lg font-semibold text-orange-800">{brl(r.amount)}</p>
                  <p className="text-xs text-stone-500">{dateTime(r.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRedemption(r.id, "APPROVE")}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRedemption(r.id, "REJECT")}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-50"
                  >
                    Recusar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
