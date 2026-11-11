import { useEffect, useRef, useState } from 'react'
import { Avatar, DayStepper, Tag } from './bits.jsx'
import { CLASSES, classLabel } from './data.js'
import { formatLong, parentMessage, statusLabel, telLink, todayISO, waLink } from './lib.js'
import { useNav } from './nav.jsx'
import {
  canOpenClass,
  classStudents,
  dayMarks,
  phoneOf,
  schoolOf,
  scopeFor,
  summarizeClass,
  wasAlerted,
} from './select.js'
import { useHazri } from './store.jsx'

export function Mark() {
  const { state, markStudent, markClass, clearClass } = useHazri()
  const nav = useNav()
  const today = todayISO()
  const scope = scopeFor(state, today)
  const classId = scope.role === 'head' ? nav.markClassId : scope.classId
  const date = nav.markDate
  const [toast, setToast] = useState('')
  const timer = useRef(null)

  function flash(text) {
    setToast(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(''), 2200)
  }

  if (!classId || !canOpenClass(state, today, classId)) {
    return (
      <div className="view">
        <article className="card">
          <h1>No class assigned</h1>
          <p className="deck">The head teacher has not assigned a class.</p>
        </article>
      </div>
    )
  }

  const roster = classStudents(state, classId)
  const marks = dayMarks(state, date)
  const summary = summarizeClass(state, date, classId)
  const needing = roster.filter((student) => marks[student.id] === 'absent' || marks[student.id] === 'leave')

  return (
    <div className="view">
      <header className="pagehead">
        <div>
          <p className="kicker">One tap for each child</p>
          <h1>{classLabel(classId)}</h1>
          <p className="deck">
            {summary.unmarked ? `${summary.unmarked} still unmarked.` : 'Every child is marked.'} Tap the same status again to undo it.
          </p>
        </div>
      </header>

      <DayStepper value={date} today={today} onChange={nav.setMarkDate} />

      {scope.role === 'head' && (
        <div className="chips" role="tablist" aria-label="Classes">
          {CLASSES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === classId ? 'chip on' : 'chip'}
              aria-selected={item.id === classId}
              onClick={() => nav.setMarkClassId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      <div className="tools noprint">
        <button
          type="button"
          className="btn solid"
          onClick={() => {
            markClass(date, classId, 'present')
            flash(`${classLabel(classId)} marked present`)
          }}
        >
          All present
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            clearClass(date, classId)
            flash('Register cleared')
          }}
        >
          Clear
        </button>
        <span className="muted">{summary.present} present · {summary.absent} absent · {summary.leave} leave</span>
      </div>

      <ol className="roster">
        {roster.map((student) => {
          const status = marks[student.id]
          return (
            <li key={student.id} className="pupil">
              <button type="button" className="who" onClick={() => nav.openStudent(student.id)}>
                <Avatar name={student.name} id={student.id} />
                <span>
                  <b>{student.name}</b>
                  <small>Roll {student.roll} · Father {student.father}</small>
                </span>
              </button>
              <div className="taps" role="group" aria-label={`Attendance for ${student.name}`}>
                {['present', 'absent', 'leave'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={status === option ? `tap on-${option}` : 'tap'}
                    aria-pressed={status === option}
                    onClick={() => markStudent(date, student.id, option)}
                  >
                    <span>{statusLabel(option)}</span>
                    <small className="tap-ur">{option === 'present' ? 'حاضر' : option === 'absent' ? 'غیر حاضر' : 'رخصت'}</small>
                  </button>
                ))}
              </div>
            </li>
          )
        })}
      </ol>

      {needing.length > 0 && (
        <div className="alertbar noprint">
          <span>{needing.length} {needing.length === 1 ? 'family' : 'families'} to tell</span>
          <button type="button" className="btn solid" onClick={() => nav.openSheet({ date, classId })}>
            Alert parents
          </button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

export function AlertSheet({ date, classId, studentId, onClose }) {
  const { state, logAlert, setPhone } = useHazri()
  const school = schoolOf(state)
  const [copied, setCopied] = useState('')
  const marks = dayMarks(state, date)
  const roster = classStudents(state, classId).filter((student) => {
    if (studentId) return student.id === studentId
    return marks[student.id] === 'absent' || marks[student.id] === 'leave'
  })

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function copy(id, text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
    } catch {
      setCopied('error')
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="card-head">
          <h2 id="alert-title">Tell the parents</h2>
          <button type="button" className="btn quiet" onClick={onClose}>Close</button>
        </div>
        <p className="deck">
          WhatsApp opens with the message written. For a live demonstration, replace the sample number with your own mobile. The 0300 numbers are not real parents.
        </p>
        {roster.length === 0 && <p>Nobody in this class is marked absent or on leave.</p>}
        <div className="stack">
          {roster.map((student) => {
            const status = marks[student.id]
            const phone = phoneOf(state, student)
            const text = status === 'absent' || status === 'leave'
              ? parentMessage({
                school,
                student,
                classLabel: classLabel(classId),
                dateLabel: formatLong(date),
                status,
              })
              : `Assalam o Alaikum,\nThis is ${school.name}. We are writing about ${student.name} (${classLabel(classId)}).\n— Hazri attendance`
            return (
              <article key={student.id} className="sheet-row">
                <header>
                  <b>{student.name}</b>
                  <Tag status={status} />
                </header>
                <label className="field">
                  Parent mobile
                  <input
                    type="tel"
                    value={phone}
                    autoComplete="off"
                    onChange={(event) => setPhone(student.id, event.target.value)}
                  />
                </label>
                <div className="row-actions">
                  <a
                    className="btn solid"
                    href={waLink(phone, text)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logAlert(student.id, date, 'whatsapp')}
                  >
                    WhatsApp
                  </a>
                  <a className="btn" href={telLink(phone)} onClick={() => logAlert(student.id, date, 'call')}>
                    Call
                  </a>
                  <button type="button" className="btn quiet" onClick={() => copy(student.id, text)}>
                    {copied === student.id ? 'Copied' : 'Copy message'}
                  </button>
                </div>
                {wasAlerted(state, student.id, date) && <small className="muted">Already opened from this demo.</small>}
              </article>
            )
          })}
        </div>
        {copied === 'error' && <p className="muted">The browser blocked copying. Use WhatsApp instead.</p>}
      </div>
    </div>
  )
}
