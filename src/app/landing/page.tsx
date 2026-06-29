import type { Metadata } from 'next'
import LandingClient from './LandingClient'

export const metadata: Metadata = {
  title: 'GDS Frame · Gestão Comercial Multi-loja',
  description: 'Ranking de vendedores, comissão automática e importação CEC — um painel para todas as lojas. Sem planilha.',
}

export default function LandingPage() {
  return <LandingClient />
}
