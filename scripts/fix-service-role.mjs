#!/usr/bin/env node
// Corrige SUPABASE_SERVICE_ROLE_KEY no .env.local sem expor a key no chat/histórico.
// Uso: node scripts/fix-service-role.mjs   (cole a key quando pedir; a entrada é oculta)
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { createInterface } from 'node:readline'

const ENV = '.env.local'
const VAR = 'SUPABASE_SERVICE_ROLE_KEY'

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    const stdout = process.stdout
    rl._writeToOutput = (s) => { if (s.includes('\n')) stdout.write('\n') } // não ecoa a key
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()) })
  })
}

function decodeJwtRole(key) {
  const parts = key.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
    return payload.role ?? null
  } catch { return null }
}

const key = await promptHidden(`Cole a service_role key (Dashboard > Settings > API) e Enter:\n`)

if (!key) { console.error('Vazio. Abortado.'); process.exit(1) }
if (key.length < 100) { console.error(`Muito curta (${key.length} chars) — parece truncada de novo. Abortado.`); process.exit(1) }

const role = decodeJwtRole(key)
if (role !== 'service_role') {
  console.error(`JWT nao e service_role (role=${role ?? 'ilegivel'}). Copie a key "service_role secret", nao a anon. Abortado.`)
  process.exit(1)
}

if (!existsSync(ENV)) { console.error(`${ENV} nao encontrado.`); process.exit(1) }
copyFileSync(ENV, ENV + '.bak')

const lines = readFileSync(ENV, 'utf8').split(/\r?\n/)
let found = false
const out = lines.map((l) => {
  if (l.startsWith(VAR + '=')) { found = true; return `${VAR}=${key}` }
  return l
})
if (!found) out.push(`${VAR}=${key}`)
writeFileSync(ENV, out.join('\n'))

console.log(`OK — ${VAR} atualizada (${key.length} chars, role=service_role). Backup em ${ENV}.bak.`)
console.log('Agora reinicie o dev server (Ctrl+C e npm run dev).')
