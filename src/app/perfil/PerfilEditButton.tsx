'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'

interface PerfilEditButtonProps {
  telefoneCorporativo: string | null
  telefonePessoal: string | null
  dataNascimento: string | null
}

export default function PerfilEditButton({
  telefoneCorporativo,
  telefonePessoal,
  dataNascimento,
}: PerfilEditButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [corporativo, setCorporativo] = useState(telefoneCorporativo ?? '')
  const [pessoal, setPessoal] = useState(telefonePessoal ?? '')
  const [nascimento, setNascimento] = useState(dataNascimento ?? '')

  function handleOpenChange(next: boolean) {
    if (next) {
      setCorporativo(telefoneCorporativo ?? '')
      setPessoal(telefonePessoal ?? '')
      setNascimento(dataNascimento ?? '')
      setError(null)
    }
    setOpen(next)
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/profile/update-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefone_corporativo: corporativo.trim() || null,
          telefone_pessoal: pessoal.trim() || null,
          data_nascimento: nascimento || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Falha ao salvar alteracoes.')
        return
      }
      router.refresh()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => handleOpenChange(true)} variant="outline" className="gap-2">
        <Pencil className="h-4 w-4" />
        Editar dados
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar meus dados</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="perfil-tel-corp">Telefone Corporativo</Label>
              <Input
                id="perfil-tel-corp"
                placeholder="Ex: (45) 99999-0000"
                value={corporativo}
                onChange={(e) => setCorporativo(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="perfil-tel-pessoal">Telefone Pessoal</Label>
              <Input
                id="perfil-tel-pessoal"
                placeholder="Ex: (45) 99999-0000"
                value={pessoal}
                onChange={(e) => setPessoal(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="perfil-nascimento">Data de Nascimento</Label>
              <Input
                id="perfil-nascimento"
                type="date"
                value={nascimento}
                onChange={(e) => setNascimento(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alteracoes'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
