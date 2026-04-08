"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [merchantCode, setMerchantCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          merchantCode: merchantCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível cadastrar.");
        setLoading(false);
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-stone-900">Cadastro de cliente</h1>
        <p className="mt-1 text-sm text-stone-500">
          Informe o código de filiação fornecido pelo seu mercado.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="merchantCode" className="block text-sm font-medium text-stone-700">
              Código do mercado
            </label>
            <input
              id="merchantCode"
              required
              placeholder="Ex.: SOL2026"
              value={merchantCode}
              onChange={(e) => setMerchantCode(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-stone-900 outline-none ring-orange-500 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700">
              Nome completo
            </label>
            <input
              id="name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none ring-orange-500 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none ring-orange-500 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Senha (mín. 6 caracteres)
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none ring-orange-500 focus:ring-2"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? "Cadastrando…" : "Criar conta"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-600">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-orange-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
