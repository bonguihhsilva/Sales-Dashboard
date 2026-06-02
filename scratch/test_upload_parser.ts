import * as fs from 'fs'
import * as path from 'path'
import { parseUploadBuffer } from '../src/lib/server-parser'

async function runTest() {
  console.log('=== Iniciando Teste de Validação do Parser LMS/Vendas ===')
  
  const mockFilePath = path.join(__dirname, 'cec_mock_sales.html')
  
  if (!fs.existsSync(mockFilePath)) {
    console.error(`Erro: Arquivo mock não encontrado em ${mockFilePath}`)
    process.exit(1)
  }

  console.log(`Lendo arquivo mock: ${mockFilePath}`)
  const buffer = fs.readFileSync(mockFilePath)

  try {
    const transactions = await parseUploadBuffer(buffer, 'cec_mock_sales.html')
    
    console.log('\n--- Transações Extraídas com Sucesso ---')
    console.log(JSON.stringify(transactions, null, 2))
    
    if (transactions.length !== 2) {
      throw new Error(`Erro de Validação: Esperava 2 transações válidas, mas obteve ${transactions.length}`)
    }

    const t1 = transactions[0]
    if (t1.vendor_id !== '30' || t1.client_id !== '1001' || t1.valor !== 200 || t1.sale_date !== '12/03/26') {
      throw new Error(`Erro de Validação nos dados da Transação 1: ${JSON.stringify(t1)}`)
    }

    const t2 = transactions[1]
    if (t2.vendor_id !== '44' || t2.client_id !== '1002' || t2.valor !== 350.5 || t2.sale_date !== '25/03/26') {
      throw new Error(`Erro de Validação nos dados da Transação 2: ${JSON.stringify(t2)}`)
    }

    console.log('\n✅ SUCESSO: O motor do parser interpretou e sanitizou perfeitamente os dados no layout do CEC!')
  } catch (err: any) {
    console.error('\n❌ FALHA NO TESTE DO PARSER:', err.message)
    process.exit(1)
  }
}

runTest()
