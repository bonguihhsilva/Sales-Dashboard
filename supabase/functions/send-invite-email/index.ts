// Supabase Edge Function — runtime Deno
// Envia email de convite via Resend. Deploy: supabase functions deploy send-invite-email --no-verify-jwt

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Sem chave configurada -> responde 200 com sent:false (email e opcional, D-05)
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ sent: false, reason: 'RESEND_API_KEY nao configurada' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  let payload: { to?: string; inviteLink?: string; senderName?: string }
  try {
    payload = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ sent: false, reason: 'JSON invalido' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const { to, inviteLink, senderName } = payload
  if (!to || !inviteLink) {
    return new Response(
      JSON.stringify({ sent: false, reason: 'Campos to e inviteLink sao obrigatorios' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Painel Da Silva</h2>
      <p>${senderName ?? 'Sua equipe'} convidou voce para acessar o Painel de Vendas Da Silva.</p>
      <p>Clique no link abaixo para definir sua senha e acessar o sistema:</p>
      <p><a href="${inviteLink}" style="background:#c8f542;color:#0e0f11;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold;">Definir minha senha</a></p>
      <p style="color:#71717a;font-size:12px;">Este link e valido por 7 dias. Se voce nao esperava este convite, ignore este email.</p>
    </div>
  `.trim()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Painel Da Silva <onboarding@resend.dev>',
      to,
      subject: 'Seu acesso ao Painel Da Silva',
      html,
    }),
  })

  const result = await res.json()
  return new Response(
    JSON.stringify({ sent: res.ok, result }),
    { status: res.ok ? 200 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
