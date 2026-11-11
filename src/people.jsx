import { useState } from 'react'
import { Avatar, DayStepper, Empty, Tag } from './bits.jsx'
import { CLASSES, classLabel } from './data.js'
import { eachDateInMonth, formatLong, formatShort, isSunday, parentMessage, parseISO, telLink, todayISO, waLink } from './lib.js'
import { useNav } from './nav.jsx'
import {
  assignmentFor,
  canOpenClass,
  classStudents,
  classTeacher,
  dayMarks,
  monthStudentRows,
  phoneOf,
  schoolOf,
  scopeFor,
  staffMarks,
  studentById,
  substituteFor,
  studentHistory,
  students,
  substitutes,
  teachers,
} from './select.js'
import { useHazri } from './store.jsx'

export function Students() {
  const { state } = useHazri()
  const nav = useNav()
  const today = todayISO()
  const scope = scopeFor(state, today)
  const [query, setQuery] = useState('')
  const [classId, setClassId] = useState(scope.classId || 'all')
  const marks = dayMarks(state, today)
  const source = scope.role === 'head'
    ? students(state).filter((student) => classId === 'all' || student.classId === classId)
    : classStudents(state, scope.classId)
  const needle = query.trim().toLowerCase()
  const shown = source.filter((student) => {
    const hay = `${student.name} ${student.father} ${student.admission}`.toLowerCase()
    return hay.includes(needle)
  })

  return (
    <div className="view">
      <header className="pagehead">
        <div>
          <p className="kicker">Profiles and history</p>
          <h1>{scope.role === 'head' || !scope.classId ? 'Students' : classLabel(scope.classId)}</h1>
        </div>
      </header>
      <input
        className="search"
        type="search"
        placeholder="Search name, father, or admission number"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {scope.role === 'head' && (
        <div className="chips">
          <button type="button" className={classId === 'all' ? 'chip on' : 'chip'} onClick={() => setClassId('all')}>
            All
          </button>
          {CLASSES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={classId === item.id ? 'chip on' : 'chip'}
              onClick={() => setClassId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
      {!scope.classId && scope.role !== 'head' ? (
        <Empty title="No class assigned" text="The head teacher has not assigned a class." />
      ) : shown.length === 0 ? (
        <Empty title="No student matches" text="Try another spelling, or clear the search." />
      ) : (
        <div className="card">
          <ul className="plain">
            {shown.map((student) => (
              <li key={student.id}>
                <button type="button" className="list-btn" onClick={() => nav.openStudent(student.id)}>
                  <Avatar name={student.name} id={student.id} size={40} />
                  <span>
                    <b>{student.name}</b>
                    <small>{classLabel(student.classId)} · Roll {student.roll} · {student.father}</small>
                  </span>
                  <Tag status={marks[student.id]} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function Profile() {
  const { state, setPhone, logAlert } = useHazri()
  const nav = useNav()
  const today = todayISO()
  const scope = scopeFor(state, today)
  const school = schoolOf(state)
  const student = studentById(state, nav.studentId)
  const [month, setMonth] = useState(today.slice(0, 7))
  const allowed = student && (scope.role === 'head' || student.classId === scope.classId)

  if (!allowed) {
    return (
      <div className="view">
        <Empty title="This profile is closed" text="You can open students from the class assigned to you." />
      </div>
    )
  }

  const row = monthStudentRows(state, month, student.classId).find((item) => item.student.id === student.id)
  const history = studentHistory(state, student.id, month)
  const absentDays = history.filter((day) => day.status === 'absent')
  const phone = phoneOf(state, student)
  const todayStatus = dayMarks(state, today)[student.id]
  const text = todayStatus === 'absent' || todayStatus === 'leave'
    ? parentMessage({
      school,
      student,
      classLabel: classLabel(student.classId),
      dateLabel: formatLong(today),
      status: todayStatus,
    })
    : `Assalam o Alaikum,\nThis is ${school.name}. We are writing about ${student.name} (${classLabel(student.classId)}).\n— Hazri attendance`
  const days = eachDateInMonth(month)
  const offset = (parseISO(days[0]).getDay() + 6) % 7
  const canEdit = canOpenClass(state, today, student.classId)

  return (
    <div className="view">
      <button type="button" className="btn quiet self noprint" onClick={() => nav.setView('students')}>
        Back to students
      </button>
      <article className="card profile-hero">
        <Avatar name={student.name} id={student.id} size={72} />
        <div>
          <p className="kicker">{classLabel(student.classId)} · Roll {student.roll}</p>
          <h1>{student.name}</h1>
          <p className="deck">Father {student.father}</p>
        </div>
      </article>

      <section className="stats">
        <Mini label="Present" value={row?.present || 0} />
        <Mini label="Absent" value={row?.absent || 0} />
        <Mini label="Leave" value={row?.leave || 0} />
        <Mini label="This month" value={row?.marked ? `${row.rate}%` : '—'} />
      </section>

      <div className="split">
        <article className="card">
          <h2>Record</h2>
          <div className="facts">
            <Fact label="Admission" value={student.admission} />
            <Fact label="Joined" value={student.joined} />
            <Fact label="Address" value={student.address} />
            <Fact label="Today" value={todayStatus ? statusWord(todayStatus) : 'Not marked'} />
          </div>
          <label className="field">
            Parent mobile
            <input
              type="tel"
              value={phone}
              autoComplete="off"
              onChange={(event) => setPhone(student.id, event.target.value)}
            />
          </label>
          <p className="muted">Put your own number here before a live WhatsApp demonstration.</p>
          <div className="row-actions">
            <a
              className="btn solid"
              href={waLink(phone, text)}
              target="_blank"
              rel="noreferrer"
              onClick={() => logAlert(student.id, today, 'whatsapp')}
            >
              WhatsApp
            </a>
            <a className="btn" href={telLink(phone)} onClick={() => logAlert(student.id, today, 'call')}>
              Call
            </a>
            {canEdit && (todayStatus === 'absent' || todayStatus === 'leave') && (
              <button
                type="button"
                className="btn"
                onClick={() => nav.openSheet({ date: today, classId: student.classId, studentId: student.id })}
              >
                Tell the parents
              </button>
            )}
            {canEdit && (
              <button type="button" className="btn quiet" onClick={() => nav.openMark(student.classId, today)}>
                Open register
              </button>
            )}
          </div>
          <p className="note">
            {absentDays.length
              ? `Absent on ${absentDays.map((day) => formatShort(day.day)).join(', ')}.`
              : 'No absences recorded this month.'}
          </p>
        </article>

        <article className="card">
          <div className="card-head">
            <h2>Attendance history</h2>
            <input
              type="month"
              value={month}
              max={today.slice(0, 7)}
              onChange={(event) => setMonth(event.target.value)}
              aria-label="History month"
            />
          </div>
          <div className="cal" aria-hidden="true">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => (
              <span key={`${label}${index}`} className="cal-head">{label}</span>
            ))}
          </div>
          <div className="cal">
            {Array.from({ length: offset }, (_, index) => (
              <span key={`pad-${index}`} className="cal-cell pad" />
            ))}
            {days.map((day) => {
              const sunday = isSunday(day)
              const future = day > today
              const status = history.find((item) => item.day === day)?.status
              const classes = ['cal-cell']
              if (sunday) classes.push('sun')
              if (future) classes.push('future')
              if (status) classes.push(status)
              if (!sunday && !future && !status) classes.push('none')
              if (day === today) classes.push('today')
              return (
                <button
                  key={day}
                  type="button"
                  className={classes.join(' ')}
                  disabled={sunday || future || !canEdit}
                  onClick={() => nav.openMark(student.classId, day)}
                >
                  {Number(day.slice(-2))}
                </button>
              )
            })}
          </div>
          <p className="muted legend-note">
            <i className="dot present" /> Present
            <i className="dot leave" /> Leave
            <i className="dot absent" /> Absent
            <i className="dot none" /> Not marked
          </p>
        </article>
      </div>
    </div>
  )
}

export function Staff() {
  const { state, markStaff, assignCover } = useHazri()
  const today = todayISO()
  const scope = scopeFor(state, today)
  const [date, setDate] = useState(today)
  if (scope.role !== 'head') return null
  const marks = staffMarks(state, date)
  const subs = substitutes(state)

  return (
    <div className="view">
      <header className="pagehead">
        <div>
          <p className="kicker">Who is in school</p>
          <h1>Staff attendance</h1>
          <p className="deck">
            Mark a teacher on leave or absent, then choose a substitute. That substitute can open only the covered class.
          </p>
        </div>
      </header>
      <DayStepper value={date} today={today} onChange={setDate} />
      <div className="staff-grid">
        {teachers(state).map((teacher) => {
          const status = marks[teacher.id]
          const away = status === 'leave' || status === 'absent'
          const assigned = substituteFor(state, date, teacher.id)
          return (
            <article key={teacher.id} className="card staff-card">
              <header className="staff-top">
                <Avatar name={teacher.name} id={teacher.id} size={42} />
                <span>
                  <b>{teacher.name}</b>
                  <small>{classLabel(teacher.classId)} · {classStudents(state, teacher.classId).length} children</small>
                </span>
                <Tag status={status} />
              </header>
              <div className="taps" role="group" aria-label={`Attendance for ${teacher.name}`}>
                {['present', 'late', 'leave', 'absent'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={status === option ? `tap on-${option}` : 'tap'}
                    aria-pressed={status === option}
                    onClick={() => markStaff(date, teacher.id, option)}
                  >
                    {option === 'present' ? 'Present' : option === 'late' ? 'Late' : option === 'leave' ? 'Leave' : 'Absent'}
                  </button>
                ))}
              </div>
              {away && (
                <label className="field">
                  Substitute for {classLabel(teacher.classId)}
                  <select
                    value={assigned?.id || ''}
                    onChange={(event) => assignCover(date, teacher.id, event.target.value)}
                  >
                    <option value="">Not assigned</option>
                    {subs.map((person) => {
                      const job = assignmentFor(state, date, person.id)
                      const busy = job && job.teacher.id !== teacher.id
                      return (
                        <option key={person.id} value={person.id}>
                          {person.name}{busy ? ` · covering ${classLabel(job.classId)}` : ''}
                        </option>
                      )
                    })}
                  </select>
                </label>
              )}
              {assigned && (
                <p className="note">{assigned.name} can mark {classLabel(teacher.classId)} and cannot open the other classes.</p>
              )}
            </article>
          )
        })}
      </div>
      <p className="fine">
        {classTeacher(state, 'four') ? 'One substitute can cover one class. Choosing them on a second teacher moves them off the first.' : ''}
      </p>
    </div>
  )
}

function Mini({ label, value }) {
  return (
    <article className="stat">
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function Fact({ label, value }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  )
}

function statusWord(status) {
  if (status === 'present') return 'Present'
  if (status === 'absent') return 'Absent'
  if (status === 'leave') return 'On leave'
  return 'Not marked'
}
