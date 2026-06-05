import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const consultaId = params.id
  if (!consultaId) {
    return NextResponse.json({ error: 'ID da consulta é obrigatório' }, { status: 400 })
  }

  const { error } = await supabase
    .from('consultas')
    .delete()
    .eq('id', consultaId)
    .eq('user_id', authData.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.from('activity_logs').insert({
    user_id: authData.user.id,
    entity_type: 'consulta',
    action: 'delete_consulta',
    meta: { consulta_id: consultaId },
  })

  return NextResponse.json({ ok: true })
}
