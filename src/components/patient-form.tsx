'use client'

import { useState } from 'react'

export function PatientForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      nome: formData.get('nome'),
      idade: formData.get('idade'),
      sexo: formData.get('sexo'),
      queixa: formData.get('queixa'),
      especialidade: formData.get('especialidade'),
      objetivo: formData.get('objetivo'),
      instagram: formData.get('instagram'),
      obs: formData.get('obs'),
    }

    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || 'Erro ao cadastrar paciente.')
      setLoading(false)
      return
    }

    form.reset()
    setMessage('Paciente cadastrado com sucesso.')
    setLoading(false)
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit} className="patient-form">
      <div className="form-grid">
        <input name="nome" className="form-input" placeholder="Nome completo" required />
        <input name="idade" className="form-input" placeholder="Idade" type="number" min="0" />
      </div>

      <div className="form-grid">
        <input name="sexo" className="form-input" placeholder="Sexo" />
        <input name="especialidade" className="form-input" placeholder="Especialidade médica" />
      </div>

      <input name="queixa" className="form-input" placeholder="Queixa principal" />
      <input name="objetivo" className="form-input" placeholder="Objetivo da consulta" />
      <input name="instagram" className="form-input" placeholder="Instagram (@usuario) — opcional" />
      <textarea name="obs" className="form-textarea" placeholder="Comorbidades / observações"></textarea>

      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? 'Salvando...' : 'Cadastrar paciente'}
      </button>

      {message ? <div className="form-message">{message}</div> : null}
    </form>
  )
}
