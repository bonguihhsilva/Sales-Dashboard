'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'

export default function RedefinirSenhaPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas nao coincidem.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError('Nao foi possivel redefinir a senha. O link pode ter expirado — solicite um novo.')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-[400px] border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl relative z-10">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl shadow-inner mb-6">
              GDS
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Nova senha</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Escolha uma nova senha para sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Nova senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-11 bg-background/50 focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Confirmar senha</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                minLength={6}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="h-11 bg-background/50 focus-visible:ring-primary/20"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3 flex items-start gap-3"
              >
                <div className="mt-0.5">⚠️</div>
                <div className="leading-tight">{error}</div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 text-sm font-medium transition-all"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
              ) : (
                <>Salvar nova senha <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
