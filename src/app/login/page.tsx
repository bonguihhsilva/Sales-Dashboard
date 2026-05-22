'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

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
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[380px] border-border">
        <CardHeader className="items-center pb-6 pt-8 px-8">
          {/* Wordmark */}
          <div className="inline-block bg-primary rounded-[10px] px-4 py-2 mb-4">
            <span
              className="text-primary-foreground font-bold text-base"
              style={{ fontFamily: 'var(--font-syne)', letterSpacing: '-0.5px' }}
            >
              DA SILVA
            </span>
          </div>
          <h1
            className="text-xl font-bold text-foreground"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Painel de Vendas
          </h1>
          <p
            className="text-xs text-muted-foreground mt-1"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Entre com suas credenciais
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs text-muted-foreground uppercase tracking-[0.08em]"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs text-muted-foreground uppercase tracking-[0.08em]"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="font-mono text-sm"
              />
            </div>

            {error && (
              <div
                className="rounded-lg px-3 py-2.5 text-xs"
                style={{
                  background: 'rgba(245,92,66,0.1)',
                  border: '1px solid rgba(245,92,66,0.3)',
                  color: '#f55c42',
                  fontFamily: 'var(--font-dm-mono)',
                }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-bold text-sm mt-2"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
