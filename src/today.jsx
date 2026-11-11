import { Avatar, Donut, Spark, Tag } from './bits.jsx'
import { CLASSES, classLabel } from './data.js'
import {
  firstName,
  formatShort,
  greeting,
  previousSchoolDay,
  todayISO,
} from './lib.js'
import { useNav } from './nav.jsx'
import {
  alertsFor,
  classStudents,
  classTeacher,
  dayMarks,
  schoolOf,
  scopeFor,
  classMonthRates,
  sparkRates,
  staffMarks,
  students,
  substituteFor,
  summarizeClass,
  summarizeSchool,
  watchList,
} from './select.js'
import { useHazri } from './store.jsx'

export function Today() {
  const { state, markOwn } = useHazri()
  const nav = useNav()
  const today = todayISO()
  const scope = scopeFor(state, today)
  if (scope.role === 'head') return <HeadToday />
  return <ClassToday scope={scope} today={today} markOwn={markOwn} nav={nav} state={state} />
}

function HeadToday() {
  const { state } = useHazri()
  const nav = useNav()
  const today = todayISO()
  const yesterday = previousSchoolDay(today)
  const school = schoolOf(state)
  const scope = scopeFor(state, today)
  const todaySummary = summarizeSchool(state, today)
  const yesterdaySummary = summarizeSchool(state, yesterday)
  const month = today.slice(0, 7)
  const points = sparkRates(state, month)
  const watches = watchList(state, month)
  const alerts = alertsFor(state).slice(0, 4)
  const classes = CLASSES.map((item) => ({
    ...item,
    summary: summarizeClass(state, today, item.id),
    teacher: classTeacher(state, item.id),
  }))
  const submitted = classes.filter((item) => item.summary.marked > 0).length
  const awayOpen = classes.find((item) => {
    const staff = staffMarks(state, today)[item.teacher?.id]
    return (staff === 'leave' || staff === 'absent') && item.summary.unmarked > 0
  })
  const nextOpen = classes.find((item) => item.summary.unmarked > 0)
  const target = (awayOpen || nextOpen || classes[0]).id
  const started = todaySummary.marked > 0

  return (
    <div className="view">
      <header className="pagehead">
        <div>
          <p className="kicker">{greeting()}, {firstName(scope.person.name)}</p>
          <h1>{school.name}</h1>
          <p className="deck">{submitted} of {classes.length} classes have started today’s register.</p>
        </div>
        <button type="button" className="btn solid" onClick={() => nav.openMark(target)}>
          Open {classLabel(target)}
        </button>
      </header>

      <section className="stats">
        <Stat label="Present today" value={todaySummary.marked ? todaySummary.present : '—'} detail={`${todaySummary.total} children on roll`} />
        <Stat label="Absent" value={todaySummary.marked ? todaySummary.absent : '—'} detail={todaySummary.marked ? 'Parents can be alerted' : 'Register not started'} />
        <Stat label="On leave" value={todaySummary.marked ? todaySummary.leave : '—'} detail="Excused for the day" />
        <Stat label="Yesterday" value={`${yesterdaySummary.rate}%`} detail={`${yesterdaySummary.present} present · ${formatShort(yesterday)}`} />
      </section>

      <div className="split">
        <article className="card">
          <div className="card-head">
            <h2>Today</h2>
            <button type="button" className="btn quiet" onClick={() => nav.openReports('daily', today)}>Daily report</button>
          </div>
          <div className="donut-row">
            <Donut present={todaySummary.present} absent={todaySummary.absent} leave={todaySummary.leave} />
            <ul className="legend">
              <li><i className="dot present" /> Present {started ? todaySummary.present : '—'}</li>
              <li><i className="dot leave" /> Leave {started ? todaySummary.leave : '—'}</li>
              <li><i className="dot absent" /> Absent {started ? todaySummary.absent : '—'}</li>
              <li><i className="dot none" /> Not marked {started ? todaySummary.unmarked : '—'}</li>
            </ul>
          </div>
        </article>
        <article className="card">
          <div className="card-head">
            <h2>This month</h2>
            <button type="button" className="btn quiet" onClick={() => nav.openReports('monthly')}>Monthly report</button>
          </div>
          <Spark points={points} />
          <p className="muted">Each point is a school day. Sundays are off, the way a Punjab school week runs.</p>
        </article>
      </div>

      <article className="card">
        <div className="card-head">
          <h2>Classes</h2>
        </div>
        <div className="class-list">
          {classes.map((item) => {
            const staff = staffMarks(state, today)[item.teacher?.id]
            const cover = item.teacher ? substituteFor(state, today, item.teacher.id) : null
            const width = item.summary.marked ? item.summary.rate : 0
            return (
              <button key={item.id} type="button" className="classrow" onClick={() => nav.openMark(item.id)}>
                <span>
                  <b>{item.name}</b>
                  <small>
                    {cover
                      ? `${item.teacher?.name} is ${staff === 'absent' ? 'absent' : 'on leave'} · ${firstName(cover.name)} covering`
                      : item.teacher?.name}
                  </small>
                </span>
                <span className="meter" aria-hidden="true">
                  <i style={{ width: `${width}%` }} />
                </span>
                <em>{item.summary.marked ? `${item.summary.rate}%` : 'Open'}</em>
              </button>
            )
          })}
        </div>
      </article>

      <div className="split">
        <article className="card">
          <div className="card-head">
            <h2>Needs a conversation</h2>
          </div>
          {watches.length === 0 ? (
            <p className="muted">Everyone with a record is at 80% or above this month.</p>
          ) : (
            <div className="stack">
              {watches.map((row) => (
                <button key={row.student.id} type="button" className="list-btn" onClick={() => nav.openStudent(row.student.id)}>
                  <Avatar name={row.student.name} id={row.student.id} size={36} />
                  <span>
                    <b>{row.student.name}</b>
                    <small>{classLabel(row.student.classId)} · {row.absent} absent · {row.leave} leave</small>
                  </span>
                  <strong className="watch-num">{row.rate}%</strong>
                </button>
              ))}
            </div>
          )}
        </article>
        <article className="card">
          <div className="card-head">
            <h2>Parent alerts</h2>
            <button type="button" className="btn quiet" onClick={() => nav.openReports('daily', yesterday)}>Yesterday</button>
          </div>
          {alerts.length === 0 ? (
            <p className="muted">Alerts you send from the register will appear here.</p>
          ) : (
            <ul className="plain">
              {alerts.map((alert) => {
                const person = students(state).find((student) => student.id === alert.studentId)
                return (
                  <li key={alert.id}>
                    <b>{person?.name || 'Student'}</b>
                    <small>{alert.channel === 'call' ? 'Call' : 'WhatsApp'} · {formatShort(alert.date)}</small>
                  </li>
                )
              })}
            </ul>
          )}
        </article>
      </div>
    </div>
  )
}

function ClassToday({ scope, today, markOwn, nav, state }) {
  const classId = scope.classId
  const summary = classId ? summarizeClass(state, today, classId) : null
  const roster = classId ? classStudents(state, classId) : []
  const marks = dayMarks(state, today)
  const ownStatus = scope.role === 'teacher' ? staffMarks(state, today)[scope.person.id] : null
  const month = today.slice(0, 7)
  const monthRow = classId ? classMonthRates(state, month).find((item) => item.id === classId) : null

  return (
    <div className="view">
      {scope.role === 'substitute' && scope.covering && (
        <div className="banner">
          <strong>You are covering {classLabel(classId)}</strong>
          <p>
            {scope.covering.name} is away today. You can mark this class, open these students, and read their report.
            The rest of the school stays with the head teacher.
          </p>
        </div>
      )}
      {scope.role === 'substitute' && !classId && (
        <EmptyCover nav={nav} />
      )}
      {scope.role === 'teacher' && (ownStatus === 'leave' || ownStatus === 'absent') && (
        <div className="banner warm">
          <strong>You are {ownStatus === 'absent' ? 'marked absent' : 'on leave'} today</strong>
          <p>The head teacher has recorded it. A substitute may be covering your class. You can still review the children.</p>
        </div>
      )}

      {classId && (
        <>
          <header className="pagehead">
            <div>
              <p className="kicker">{greeting()}, {firstName(scope.person.name)}</p>
              <h1>{classLabel(classId)}</h1>
              <p className="deck">{summary.marked ? `${summary.present} present · ${summary.absent} absent · ${summary.leave} leave` : 'The register is open. One tap for each child.'}</p>
            </div>
            <button type="button" className="btn solid" onClick={() => nav.openMark(classId)}>
              {summary.marked ? 'Edit register' : 'Take attendance'}
            </button>
          </header>

          <section className="stats">
            <Stat label="Present" value={summary.marked ? summary.present : '—'} detail={`of ${summary.total}`} />
            <Stat label="Absent" value={summary.marked ? summary.absent : '—'} detail="Ready for a parent alert" />
            <Stat label="Leave" value={summary.marked ? summary.leave : '—'} detail="Excused" />
            <Stat label="This month" value={monthRow?.marked ? `${monthRow.rate}%` : '—'} detail="Present on marked days" />
          </section>

          <article className="card">
            <div className="card-head">
              <h2>Children</h2>
            </div>
            <ul className="plain people">
              {roster.map((student) => (
                <li key={student.id}>
                  <button type="button" className="list-btn" onClick={() => nav.openStudent(student.id)}>
                    <Avatar name={student.name} id={student.id} size={36} />
                    <span>
                      <b>{student.name}</b>
                      <small>Roll {student.roll} · {student.father}</small>
                    </span>
                    <Tag status={marks[student.id]} />
                  </button>
                </li>
              ))}
            </ul>
          </article>

          {scope.role === 'teacher' && ownStatus !== 'leave' && ownStatus !== 'absent' && (
            <article className="card">
              <div className="card-head">
                <h2>Your attendance</h2>
                <Tag status={ownStatus} />
              </div>
              <p className="muted">Tap when you arrive. Leave and absence are recorded by the head teacher.</p>
              <div className="taps">
                <button type="button" className={ownStatus === 'present' ? 'tap on-present' : 'tap'} onClick={() => markOwn(today, 'present')}>
                  Present
                </button>
                <button type="button" className={ownStatus === 'late' ? 'tap on-late' : 'tap'} onClick={() => markOwn(today, 'late')}>
                  Late
                </button>
              </div>
            </article>
          )}
        </>
      )}
    </div>
  )
}

function EmptyCover() {
  return (
    <article className="card">
      <h1>No class today</h1>
      <p className="deck">The head teacher has not assigned a class.</p>
    </article>
  )
}

function Stat({ label, value, detail }) {
  return (
    <article className="stat">
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <span className="stat-sub">{detail}</span>
    </article>
  )
}
