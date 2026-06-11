import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">NetX Hub</h1>
        <p className="text-sm text-slate-500">Licenciamento e cobrança</p>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href="/admin"
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          Painel administrativo →
          <span className="block text-xs font-normal text-slate-500">
            Equipe NetX — clientes, faturas, bloqueios
          </span>
        </Link>
        <Link
          href="/portal"
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          Central do cliente →
          <span className="block text-xs font-normal text-slate-500">
            ISP — contrato, faturas, pagamento
          </span>
        </Link>
      </div>
    </main>
  );
}
