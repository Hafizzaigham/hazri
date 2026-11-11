import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { applyRows, cloud, pullRegisters, pushRegisters, sharedSignature, watchRegisters } from './cloud.js'
import { STORAGE_KEY, freshState, loadState } from './data.js'
import { todayISO, uid } from './lib.js'
import { canOpenClass, classStudents, personById, students as rosterOf } from './select.js'

const HazriContext = createContext(null)

export function HazriProvider({ children }) {
  const [state, setState] = useState(loadState)
  const [storageMode, setStorageMode] = useState(cloud ? 'checking' : 'local')
  const sent = useRef('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!cloud) return undefined
    let stop = false
    pullRegisters().then(({ data, error }) => {
      if (stop) return
      if (error || !data) {
        setStorageMode('offline')
        return
      }
      if (data.length) {
        setState((current) => {
          const next = applyRows(current, data)
          sent.current = sharedSignature(next)
          return next
        })
      }
      setStorageMode('shared')
    })
    const unwatch = watchRegisters((row) => {
      setState((current) => {
        const next = applyRows(current, [row])
        const signature = sharedSignature(next)
        if (signature === sharedSignature(current)) return current
        sent.current = signature
        return next
      })
    })
    return () => {
      stop = true
      unwatch()
    }
  }, [])

  useEffect(() => {
    if (!cloud || storageMode !== 'shared') return undefined
    const signature = sharedSignature(state)
    if (signature === sent.current) return undefined
    const timer = window.setTimeout(() => {
      sent.current = signature
      pushRegisters(state).then(({ error }) => {
        if (error) sent.current = ''
      })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [state, storageMode])

  function chooseSchool(schoolId) {
    setState((current) => ({ ...current, schoolId, session: null }))
  }

  function enter(personId) {
    setState((current) => {
      const person = personById(current, personId)
      if (!person) return current
      return { ...current, session: { personId: person.id } }
    })
  }

  function signOut() {
    setState((current) => ({ ...current, session: null }))
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY)
    setState((current) => freshState(current.schoolId || 'alnoor'))
  }

  function studentClass(current, studentId) {
    return rosterOf(current).find((student) => student.id === studentId)?.classId || null
  }

  function markStudent(date, studentId, status) {
    setState((current) => {
      const classId = studentClass(current, studentId)
      if (!classId || !canOpenClass(current, todayISO(), classId)) return current
      const schoolId = current.schoolId
      const day = { ...(current.attendance[schoolId]?.[date] || {}) }
      if (day[studentId] === status) delete day[studentId]
      else day[studentId] = status
      return {
        ...current,
        attendance: {
          ...current.attendance,
          [schoolId]: { ...current.attendance[schoolId], [date]: day },
        },
      }
    })
  }

  function markClass(date, classId, status) {
    setState((current) => {
      if (!canOpenClass(current, todayISO(), classId)) return current
      const schoolId = current.schoolId
      const day = { ...(current.attendance[schoolId]?.[date] || {}) }
      for (const student of classStudents(current, classId)) day[student.id] = status
      return {
        ...current,
        attendance: {
          ...current.attendance,
          [schoolId]: { ...current.attendance[schoolId], [date]: day },
        },
      }
    })
  }

  function clearClass(date, classId) {
    setState((current) => {
      if (!canOpenClass(current, todayISO(), classId)) return current
      const schoolId = current.schoolId
      const day = { ...(current.attendance[schoolId]?.[date] || {}) }
      for (const student of classStudents(current, classId)) delete day[student.id]
      return {
        ...current,
        attendance: {
          ...current.attendance,
          [schoolId]: { ...current.attendance[schoolId], [date]: day },
        },
      }
    })
  }

  function markStaff(date, teacherId, status) {
    setState((current) => {
      if (personById(current, current.session?.personId)?.role !== 'head') return current
      const schoolId = current.schoolId
      const day = { ...(current.staff[schoolId]?.[date] || {}) }
      const coverDay = { ...(current.cover[schoolId]?.[date] || {}) }
      if (day[teacherId] === status) {
        delete day[teacherId]
        delete coverDay[teacherId]
      } else {
        day[teacherId] = status
        if (status === 'present' || status === 'late') delete coverDay[teacherId]
      }
      return {
        ...current,
        staff: { ...current.staff, [schoolId]: { ...current.staff[schoolId], [date]: day } },
        cover: { ...current.cover, [schoolId]: { ...current.cover[schoolId], [date]: coverDay } },
      }
    })
  }

  function markOwn(date, status) {
    setState((current) => {
      const person = personById(current, current.session?.personId)
      if (!person || person.role !== 'teacher') return current
      if (status !== 'present' && status !== 'late') return current
      const schoolId = current.schoolId
      const day = { ...(current.staff[schoolId]?.[date] || {}) }
      if (day[person.id] === 'leave' || day[person.id] === 'absent') return current
      if (day[person.id] === status) delete day[person.id]
      else day[person.id] = status
      return {
        ...current,
        staff: { ...current.staff, [schoolId]: { ...current.staff[schoolId], [date]: day } },
      }
    })
  }

  function assignCover(date, teacherId, substituteId) {
    setState((current) => {
      if (personById(current, current.session?.personId)?.role !== 'head') return current
      const schoolId = current.schoolId
      const staffDay = current.staff[schoolId]?.[date] || {}
      if (staffDay[teacherId] !== 'leave' && staffDay[teacherId] !== 'absent') return current
      const day = { ...(current.cover[schoolId]?.[date] || {}) }
      if (!substituteId) {
        delete day[teacherId]
      } else {
        for (const key of Object.keys(day)) {
          if (day[key] === substituteId) delete day[key]
        }
        day[teacherId] = substituteId
      }
      return {
        ...current,
        cover: { ...current.cover, [schoolId]: { ...current.cover[schoolId], [date]: day } },
      }
    })
  }

  function logAlert(studentId, date, channel) {
    setState((current) => {
      const classId = studentClass(current, studentId)
      if (!classId || !canOpenClass(current, todayISO(), classId)) return current
      const schoolId = current.schoolId
      const next = [
        { id: uid(), studentId, date, channel, at: new Date().toISOString() },
        ...(current.alerts[schoolId] || []),
      ].slice(0, 60)
      return { ...current, alerts: { ...current.alerts, [schoolId]: next } }
    })
  }

  function setPhone(studentId, phone) {
    setState((current) => {
      const classId = studentClass(current, studentId)
      if (!classId || !canOpenClass(current, todayISO(), classId)) return current
      return { ...current, phones: { ...current.phones, [studentId]: phone } }
    })
  }

  const api = {
    state,
    storageMode,
    chooseSchool,
    enter,
    signOut,
    reset,
    markStudent,
    markClass,
    clearClass,
    markStaff,
    markOwn,
    assignCover,
    logAlert,
    setPhone,
  }

  return <HazriContext.Provider value={api}>{children}</HazriContext.Provider>
}

export function useHazri() {
  const ctx = useContext(HazriContext)
  if (!ctx) throw new Error('Hazri store is missing')
  return ctx
}
