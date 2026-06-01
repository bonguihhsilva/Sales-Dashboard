'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function ConviteForm({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const pwdValid = password && password.length >= 8
      && /[A-Z]/.test(password)
      && /[0-9]/.test(password)
    if (!pwdValid) {
      setError('A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula e um número.')
      return
    }
    if (password !== confirm) {
      setError('As senhas nao conferem.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/admin/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Falha ao definir senha.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  if (success) {
    return (
      <p
        role="status"
        className="text-[12px] font-mono text-muted-foreground text-center"
      >
        Senha definida com sucesso! Redirecionando...
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <p className="text-[10px] text-muted-foreground font-mono mt-1">
          Mínimo 8 caracteres, uma letra maiúscula e um número.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmar">Confirmar senha</Label>
        <Input
          id="confirmar"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="bg-destructive/10 border border-destructive/30 text-destructive text-[12px] rounded-md px-3 py-2"
        >
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Definindo...' : 'Definir senha'}
      </Button>
    </form>
  )
}
