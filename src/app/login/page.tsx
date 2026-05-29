'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos. Verifique e tente novamente.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-[400px] border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl relative z-10">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl shadow-inner mb-6">
              GDS
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Acesse sua conta para ver seus resultados
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome@empresa.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-11 bg-background/50 focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</>
              ) : (
                <>Entrar <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
