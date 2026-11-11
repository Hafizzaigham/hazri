import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const cloud = url && key ? createClient(url, key) : null

const SCHOOLS = ['alnoor', 'pef42']

export function stateToRows(state) {
  return SCHOOLS.map((schoolId) => {
    const phones = {}
    for (const [id, phone] of Object.entries(state.phones || {})) {
      if (id.startsWith(`${schoolId}-`)) phones[id] = phone
    }
    return {
      school_id: schoolId,
      phones,
      attendance: state.attendance?.[schoolId] || {},
      staff: state.staff?.[schoolId] || {},
      cover: state.cover?.[schoolId] || {},
      alerts: state.alerts?.[schoolId] || [],
    }
  })
}

export function applyRows(current, rows) {
  const next = {
    ...current,
    phones: { ...current.phones },
    attendance: { ...current.attendance },
    staff: { ...current.staff },
    cover: { ...current.cover },
    alerts: { ...current.alerts },
  }
  for (const row of rows) {
    if (!row?.school_id) continue
    const id = row.school_id
    next.attendance = { ...next.attendance, [id]: row.attendance || {} }
    next.staff = { ...next.staff, [id]: row.staff || {} }
    next.cover = { ...next.cover, [id]: row.cover || {} }
    next.alerts = { ...next.alerts, [id]: row.alerts || [] }
    for (const phoneId of Object.keys(next.phones)) {
      if (phoneId.startsWith(`${id}-`)) delete next.phones[phoneId]
    }
    Object.assign(next.phones, row.phones || {})
  }
  return next
}

export function sharedSignature(state) {
  return JSON.stringify(stateToRows(state))
}

export function pullRegisters() {
  return cloud.from('registers').select('school_id,phones,attendance,staff,cover,alerts')
}

export function pushRegisters(state) {
  return cloud.from('registers').upsert(stateToRows(state), { onConflict: 'school_id' })
}

export function watchRegisters(onRow) {
  const channel = cloud
    .channel('hazri-registers')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'registers' }, (payload) => {
      if (payload.new?.school_id) onRow(payload.new)
    })
    .subscribe()
  return () => {
    cloud.removeChannel(channel)
  }
}
