import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const nome = String(body.nome || 'Paciente')
  const queixa = String(body.queixa || 'queixa não informada')

  return NextResponse.json({
    resumo: `Resumo do caso de ${nome}: queixa principal de ${queixa}. Informações adicionais foram registradas para análise clínica.`,
    hipoteses:
      '1. Hipótese primária relevante ao quadro clínico
2. Hipótese secundária a ser considerada com base em sinais e sintomas',
    diferenciais:
      '1. Diagnóstico diferencial A
2. Diagnóstico diferencial B
3. Diagnóstico diferencial C',
    exames:
      'Hemograma completo, eletrólitos, imagem conforme suspeita clínica, função renal/hídrica se indicado.',
    conduta:
      'Conduta inicial baseada em suporte, monitorização e investigação complementar conforme necessidade.',
    redFlags:
      'Sinais de alerta: dispneia, dor torácica intensa, alteração do nível de consciência, hipotensão.',
    prescricao:
      'Prescrição inicial sugerida com medicamentos de primeira linha, ajustada ao quadro clínico.',
  })
}
