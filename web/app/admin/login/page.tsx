'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { adminApi, adminToken, HubApiError } from '@/lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    adminToken.set(token.trim());
    try {
      await adminApi.ping(); // valida o token contra a API
      router.replace('/admin');
    } catch (e2) {
      adminToken.clear();
      setErr(e2 instanceof HubApiError ? 'Token inválido.' : 'Falha ao conectar na API do Hub.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-xl font-bold">Painel NetX Hub</h1>
      <p className="text-sm text-slate-500">Acesso da equipe NetX (admin token).</p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="password"
          placeholder="x-admin-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          autoFocus
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          disabled={loading || !token.trim()}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
