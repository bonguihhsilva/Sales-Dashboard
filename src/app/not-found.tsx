import Link from 'next/link'

// Captura rotas inexistentes (404) e chamadas a notFound() em qualquer segmento.
// Server Component — sem 'use client' (não precisa de estado/handlers).
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-margin-page">
      <div className="glass-card border border-border rounded-2xl p-10 max-w-md w-full text-center flex flex-col gap-4">
        <span className="material-symbols-outlined text-5xl text-muted-foreground mx-auto">search_off</span>
        <p className="text-4xl font-bold text-foreground font-mono">404</p>
        <h1 className="text-lg font-bold text-foreground">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground font-mono">
          O endereço acessado não existe ou foi movido.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/dashboard"
            className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
