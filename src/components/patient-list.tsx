'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Patient = {
  id: string
  nome: string | null
  idade: number | null
  sexo: string | null
  queixa: string | null
  especialidade: string | null
  created_at: string | null
}

type PatientListProps = {
  patients: Patient[]
}

export function PatientList({ patients: initialPatients }: PatientListProps) {
  const [patients, setPatients] = useState(initialPatients)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleDelete(id: string, nome: string | null) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${nome || 'este paciente'}? Essa ação não pode ser desfeita.`
    )

    if (!confirmed) return
    setLoadingId(id)
    setMessage('')

    const response = await fetch(`/api/patients/${id}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || 'Não foi possível excluir o paciente.')
      setLoadingId(null)
      return
    }

    setPatients((current) => current.filter((patient) => patient.id !== id))
    setMessage('Paciente excluído com sucesso.')
    setLoadingId(null)
    router.refresh()
  }

  return (
    <div className="patient-list">
      {message ? <div className="alert-message">{message}</div> : null}

      {patients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">Nenhum paciente cadastrado ainda</div>
          <div className="empty-subtitle">
            Use o formulário acima para criar o primeiro paciente e acompanhar seu histórico.
          </div>
        </div>
      ) : (
        <div className="patient-grid">
          {patients.map((patient) => (
            <article key={patient.id} className="patient-card">
              <div className="patient-card-header">
                <div>
                  <h3 className="patient-card-name">{patient.nome || 'Paciente sem nome'}</h3>
                  <p className="patient-card-meta">
                    {patient.idade ? `${patient.idade} anos` : 'Idade não informada'}
                    {patient.sexo ? ` • ${patient.sexo}` : ''}
                    {patient.especialidade ? ` • ${patient.especialidade}` : ''}
                  </p>
                </div>
                <span className="badge badge-soft">Paciente</span>
              </div>

              <p className="patient-card-complaint">{patient.queixa || 'Sem queixa registrada'}</p>

              <div className="patient-card-actions">
                <button type="button" className="secondary-btn" disabled>
                  Editar
                </button>
                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => handleDelete(patient.id, patient.nome)}
                  disabled={loadingId === patient.id}
                >
                  {loadingId === patient.id ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
