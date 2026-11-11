import { useEffect, useState } from 'react'
import { Gate } from './gate.jsx'
import { Icon, Logo } from './icons.jsx'
import { AlertSheet, Mark } from './mark.jsx'
import { NavProvider, useNav } from './nav.jsx'
import { Profile, Staff, Students } from './people.jsx'
import { Reports } from './reports.jsx'
import { roleLabel, schoolOf, scopeFor } from './select.js'
import { useHazri } from './store.jsx'
import { Today } from './today.jsx'
import { todayISO } from './lib.js'

export default function App() {
  const { state, signOut, reset } = useHazri()
  const [view, setView] = useState('today')
  const [studentId, setStudentId] = useState(null)
  const [markClassId, setMarkClassId] = useState('four')
  const [markDate, setMarkDate] = useState(todayISO)
  const [reportTab, setReportTab] = useState('daily')
  const [reportDate, setReportDate] = useState(todayISO)
  const [reportMonth, setReportMonth] = useState(() => todayISO().slice(0, 7))
  const [sheet, setSheet] = useState(null)
  const personId = state.session?.personId || ''

  useEffect(() => {
    setView('today')
    setMarkDate(todayISO())
    setReportDate(todayISO())
    setSheet(null)
  }, [personId])

  useEffect(() => {
    const school = schoolOf(state)
    document.title = personId ? `${school.name} · Hazri` : 'Hazri — School attendance'
  }, [personId, state])

  const nav = {
    view,
    setView,
    studentId,
    markClassId,
    setMarkClassId,
    markDate,
    setMarkDate,
    reportTab,
    setReportTab,
    reportDate,
    setReportDate,
    reportMonth,
    setReportMonth,
    home() {
      setView('today')
    },
    openMark(classId, date) {
      if (classId) setMarkClassId(classId)
      if (date) setMarkDate(date)
      setView('mark')
    },
    openStudent(id) {
      setStudentId(id)
      setView('student')
    },
    openReports(tab, date) {
      if (tab) setReportTab(tab)
      if (date) setReportDate(date)
      setView('reports')
    },
    openSheet(payload) {
      setSheet(payload)
    },
    signOut() {
      signOut()
      setView('today')
      setSheet(null)
    },
    reset() {
      reset()
      setView('today')
      setSheet(null)
    },
  }

  return (
    <NavProvider value={nav}>
      {state.session ? <Shell /> : <Gate />}
      {sheet?.classId && (
        <AlertSheet
          date={sheet.date}
          classId={sheet.classId}
          studentId={sheet.studentId}
          onClose={() => setSheet(null)}
        />
      )}
    </NavProvider>
  )
}

function Shell() {
  const { state, storageMode } = useHazri()
  const nav = useNav()
  const today = todayISO()
  const scope = scopeFor(state, today)
  const school = schoolOf(state)
  const current = nav.view === 'student' ? 'students' : nav.view
  const items = [
    { id: 'today', label: 'Today', icon: 'today' },
    { id: 'mark', label: 'Register', icon: 'register' },
    { id: 'students', label: 'Students', icon: 'students' },
    { id: 'reports', label: 'Reports', icon: 'reports' },
  ]
  if (scope.role === 'head') items.push({ id: 'staff', label: 'Staff', icon: 'staff' })

  return (
    <div className="shell">
      <aside className="rail">
        <Logo tone="light" />
        <nav className="rail-nav" aria-label="Primary">
          {items.map((item) => (
            <button key={item.id} type="button" className={current === item.id ? 'on' : ''} onClick={() => nav.setView(item.id)}>
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="rail-foot">
          <p className="whoami">
            <b>{scope.person?.name}</b>
            <span>{roleLabel(scope)} · {school.name}</span>
          </p>
          <button type="button" className="btn" onClick={nav.signOut}>Sign out</button>
          <button type="button" className="btn" onClick={nav.reset}>Reset demo</button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar noprint">
          <div>
            <p className="eyebrow">{school.kind}</p>
            <strong>{school.name}</strong>
          </div>
          <div className="top-meta">
            <span>{scope.person?.name}</span>
            <span className="pill">{roleLabel(scope)}</span>
            <span>{storageMode === 'shared' ? 'Shared database' : 'This browser'}</span>
            <button type="button" className="btn quiet mobile-only" onClick={nav.signOut}>Sign out</button>
          </div>
        </header>
        {nav.view === 'today' && <Today />}
        {nav.view === 'mark' && <Mark />}
        {nav.view === 'students' && <Students />}
        {nav.view === 'student' && <Profile />}
        {nav.view === 'reports' && <Reports />}
        {nav.view === 'staff' && scope.role === 'head' && <Staff />}
      </div>
      <nav className="bottomnav" aria-label="Primary">
        {items.map((item) => (
          <button key={item.id} type="button" className={current === item.id ? 'on' : ''} onClick={() => nav.setView(item.id)}>
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
