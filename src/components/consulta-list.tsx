'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Consulta = {
  id: string
  nome: string | null
  queixa: string | null
  created_at: string | null
}

type ConsultaListProps = {
  consultas: Consulta[]
}

export function ConsultaList({ consultas: initialConsultas }: ConsultaListProps) {
  const [consultas, setConsultas] = useState(initialConsultas)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleDelete(id: string, nome: string | null) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a consulta de ${nome || 'este paciente'}?`
    )

    if (!confirmed) return

    setLoadingId(id)
    setMessage('')

    const response = await fetch(`/api/consultas/${id}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || 'Erro ao excluir a consulta.')
      setLoadingId(null)
      return
    }

    setConsultas((current) => current.filter((consulta) => consulta.id !== id))
    setMessage('Consulta excluída com sucesso.')
    setLoadingId(null)
    router.refresh()
  }

  return (
    <div className="consulta-list">
      {message ? <div className="alert-message">{message}</div> : null}

      {consultas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">Nenhuma consulta registrada</div>
          <div className="empty-subtitle">
            Salve uma consulta para acompanhar seus casos e treinar a IA futuramente.
          </div>
        </div>
      ) : (
        <div className="consulta-grid">
          {consultas.map((consulta) => (
            <article key={consulta.id} className="consulta-card">
              <div>
                <h3 className="consulta-name">{consulta.nome || 'Paciente sem nome'}</h3>
                <p className="consulta-meta">
                  {consulta.queixa || 'Sem queixa registrada'}
                </p>
              </div>
              <div className="consulta-footer">
                <span className="consulta-date">
                  {consulta.created_at ? new Date(consulta.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }) : 'Data indisponível'}
                </span>
                <div className="consulta-actions">
                  <Link href={`/consulta-audio/${consulta.id}`} className="secondary-btn">
                    Ver detalhes
                  </Link>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleDelete(consulta.id, consulta.nome)}
                    disabled={loadingId === consulta.id}
                  >
                    {loadingId === consulta.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
