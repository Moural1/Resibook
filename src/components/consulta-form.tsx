'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Patient = {
  id: string
  nome: string | null
}

type AnalysisResult = {
  resumo_do_caso: string
  hipoteses_principais: string
  diagnosticos_diferenciais: string
  exames_sugeridos: string
  conduta_inicial: string
  red_flags: string
  prescricao_inicial_sugerida: string
  observacoes_de_seguranca: string
}

type ConsultaFormProps = {
  patients: Patient[]
}

export function ConsultaForm({ patients }: ConsultaFormProps) {
  const [loading, setLoading] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [nome, setNome] = useState('')
  const [savedConsultaId, setSavedConsultaId] = useState<string | null>(null)
  const router = useRouter()

  function handlePatientChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const patientId = event.target.value
    setSelectedPatientId(patientId)

    if (!patientId) {
      return
    }

    const patient = patients.find((item) => item.id === patientId)
    if (patient?.nome) {
      setNome(patient.nome)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    if (savedConsultaId) {
      setMessage('Consulta já salva.')
      setLoading(false)
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      patient_id: selectedPatientId || null,
      nome: nome || String(formData.get('nome') || '').trim(),
      idade: String(formData.get('idade') || '').trim(),
      sexo: String(formData.get('sexo') || '').trim(),
      queixa: String(formData.get('queixa') || '').trim(),
      historia: String(formData.get('historia') || '').trim(),
      comorbidades: String(formData.get('comorbidades') || '').trim(),
      medicacoes: String(formData.get('medicacoes') || '').trim(),
      exame_fisico: String(formData.get('exame_fisico') || '').trim(),
      exames_disponiveis: String(formData.get('exames_disponiveis') || '').trim(),
      observacoes: String(formData.get('observacoes') || '').trim(),
      resumo: analysis?.resumo_do_caso || '',
      conduta: analysis?.conduta_inicial || '',
      prescricao: analysis?.prescricao_inicial_sugerida || '',
      analysis: analysis || null,
    }

    const response = await fetch('/api/consultas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || 'Erro ao salvar a consulta.')
      setLoading(false)
      return
    }

    form.reset()
    setNome('')
    setAnalysis(null)
    setSavedConsultaId(data.id ?? null)
    setMessage('Consulta salva com sucesso.')
    setLoading(false)
    router.refresh()
  }

  async function handleAnalyze() {
    setAnalysisLoading(true)
    setMessage('')

    const form = document.querySelector<HTMLFormElement>('form.consulta-form')
    const formData = new FormData(form!)

    const payload = {
      nome: nome || String(formData.get('nome') || '').trim(),
      idade: String(formData.get('idade') || '').trim(),
      sexo: String(formData.get('sexo') || '').trim(),
      queixa: String(formData.get('queixa') || '').trim(),
      historia: String(formData.get('historia') || '').trim(),
      comorbidades: String(formData.get('comorbidades') || '').trim(),
      medicacoes: String(formData.get('medicacoes') || '').trim(),
      exame_fisico: String(formData.get('exame_fisico') || '').trim(),
      exames_disponiveis: String(formData.get('exames_disponiveis') || '').trim(),
      observacoes: String(formData.get('observacoes') || '').trim(),
    }

    const aiResponse = await fetch('/api/ai/case-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const aiData = await aiResponse.json()

    if (!aiResponse.ok) {
      setMessage(aiData.error || 'Falha ao gerar análise com IA.')
      setAnalysisLoading(false)
      return
    }

    const analysisResult: AnalysisResult = {
      resumo_do_caso: aiData.resumo_do_caso || '',
      hipoteses_principais: aiData.hipoteses_principais || '',
      diagnosticos_diferenciais: aiData.diagnosticos_diferenciais || '',
      exames_sugeridos: aiData.exames_sugeridos || '',
      conduta_inicial: aiData.conduta_inicial || '',
      red_flags: aiData.red_flags || '',
      prescricao_inicial_sugerida: aiData.prescricao_inicial_sugerida || '',
      observacoes_de_seguranca: aiData.observacoes_de_seguranca || '',
    }

    setAnalysis(analysisResult)

    const savePayload = {
      patient_id: selectedPatientId || null,
      nome: payload.nome,
      idade: payload.idade,
      sexo: payload.sexo,
      queixa: payload.queixa,
      historia: payload.historia,
      comorbidades: payload.comorbidades,
      medicacoes: payload.medicacoes,
      exame_fisico: payload.exame_fisico,
      exames_disponiveis: payload.exames_disponiveis,
      observacoes: payload.observacoes,
      resumo: analysisResult.resumo_do_caso,
      conduta: analysisResult.conduta_inicial,
      prescricao: analysisResult.prescricao_inicial_sugerida,
      analysis: analysisResult,
    }

    const saveResponse = await fetch('/api/consultas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savePayload),
    })

    const saveData = await saveResponse.json()

    if (!saveResponse.ok) {
      setMessage(saveData.error || 'Análise gerada, mas falha ao salvar consulta.')
      setAnalysisLoading(false)
      return
    }

    setSavedConsultaId(saveData.id ?? null)
    setMessage('Análise IA gerada e consulta salva com sucesso.')
    setAnalysisLoading(false)
    router.refresh()
  }

  return (
    <div className="consulta-form-wrapper">
      <form onSubmit={handleSubmit} className="consulta-form">
        <div className="form-grid">
          <select
            name="patient_id"
            className="form-select"
            value={selectedPatientId}
            onChange={handlePatientChange}
          >
            <option value="">Paciente cadastrado (opcional)</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.nome || 'Paciente sem nome'}
              </option>
            ))}
          </select>
          <input
            name="nome"
            className="form-input"
            placeholder="Nome do paciente"
            required
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          />
        </div>

        <div className="form-grid">
          <input name="idade" className="form-input" placeholder="Idade" type="number" min="0" />
          <input name="sexo" className="form-input" placeholder="Sexo" />
        </div>

        <input name="queixa" className="form-input" placeholder="Queixa principal" required />
        <textarea name="historia" className="form-textarea" placeholder="História clínica" />
        <textarea name="comorbidades" className="form-textarea" placeholder="Comorbidades" />
        <textarea name="medicacoes" className="form-textarea" placeholder="Medicações em uso" />
        <textarea name="exame_fisico" className="form-textarea" placeholder="Exame físico" />
        <textarea name="exames_disponiveis" className="form-textarea" placeholder="Exames disponíveis" />
        <textarea name="observacoes" className="form-textarea" placeholder="Observações adicionais" />

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={handleAnalyze} disabled={analysisLoading}>
            {analysisLoading ? 'Analisando...' : 'Analisar com IA'}
          </button>
          <button type="submit" className="primary-btn" disabled={loading || !!savedConsultaId}>
            {savedConsultaId ? 'Consulta salva' : loading ? 'Salvando...' : 'Salvar consulta'}
          </button>
        </div>

        {message ? <div className="form-message">{message}</div> : null}
      </form>

      {analysis ? (
        <div className="analysis-panel">
          <h3 className="analysis-title">Resultado da Análise IA</h3>
          <div className="analysis-block">
            <h4>Resumo do caso</h4>
            <p>{analysis.resumo_do_caso}</p>
          </div>
          <div className="analysis-block">
            <h4>Hipóteses principais</h4>
            <p>{analysis.hipoteses_principais}</p>
          </div>
          <div className="analysis-block">
            <h4>Diagnósticos diferenciais</h4>
            <p>{analysis.diagnosticos_diferenciais}</p>
          </div>
          <div className="analysis-block">
            <h4>Exames sugeridos</h4>
            <p>{analysis.exames_sugeridos}</p>
          </div>
          <div className="analysis-block">
            <h4>Conduta inicial</h4>
            <p>{analysis.conduta_inicial}</p>
          </div>
          <div className="analysis-block">
            <h4>Red flags</h4>
            <p>{analysis.red_flags}</p>
          </div>
          <div className="analysis-block">
            <h4>Prescrição inicial sugerida</h4>
            <p>{analysis.prescricao_inicial_sugerida}</p>
          </div>
          <div className="analysis-block">
            <h4>Observações de segurança</h4>
            <p>{analysis.observacoes_de_seguranca}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
