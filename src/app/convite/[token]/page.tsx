import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { ConviteForm } from './ConviteForm'

export const metadata = { title: 'DA SILVA — Definir senha' }

export default async function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const supabase = await createClient()
  const { data: convite } = await supabase
    .from('convites')
    .select('usado, expira_em')
    .eq('token', token)
    .maybeSingle()

  type ErrState = 'invalid' | 'expired' | 'used' | null
  let errState: ErrState = null
  if (!convite) errState = 'invalid'
  else if (convite.usado) errState = 'used'
  else if (new Date(convite.expira_em) < new Date()) errState = 'expired'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[380px]">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <span className="inline-block bg-primary text-primary-foreground rounded-lg px-4 py-2 font-bold text-base">
              DA SILVA
            </span>
          </div>

          {errState ? (
            <div className="flex flex-col items-center text-center space-y-3">
              <AlertCircle className="text-destructive" size={40} />
              {errState === 'invalid' && (
                <>
                  <h1 className="text-lg font-bold">Link invalido</h1>
                  <p className="text-[12px] text-muted-foreground font-mono">
                    Solicite um novo convite ao seu gerente.
                  </p>
                </>
              )}
              {errState === 'expired' && (
                <>
                  <h1 className="text-lg font-bold">Link expirado</h1>
                  <p className="text-[12px] text-muted-foreground font-mono">
                    Solicite um novo convite — links sao validos por 7 dias.
                  </p>
                </>
              )}
              {errState === 'used' && (
                <>
                  <h1 className="text-lg font-bold">Link ja utilizado</h1>
                  <p className="text-[12px] text-muted-foreground font-mono">
                    Faca login com suas credenciais.
                  </p>
                  <a href="/login" className="text-[12px] font-mono underline text-primary">
                    Ir para o login
                  </a>
                </>
              )}
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-center">Definir senha</h1>
              <p className="text-[12px] text-muted-foreground font-mono text-center mt-1 mb-6">
                Bem-vindo(a) ao Da Silva. Escolha uma senha para acessar o painel.
              </p>
              <ConviteForm token={token} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
