import { DayStepper, Tag } from './bits.jsx'
import { CLASSES, classLabel } from './data.js'
import { formatLong, todayISO } from './lib.js'
import { Logo } from './icons.jsx'
import { useNav } from './nav.jsx'
import {
  classMonthRates,
  classStudents,
  dayMarks,
  monthStudentRows,
  phoneOf,
  schoolOf,
  scopeFor,
  summarizeClass,
  summarizeSchool,
  band,
  bandLabel,
} from './select.js'
import { useHazri } from './store.jsx'

export function Reports() {
  const nav = useNav()
  return (
    <div className="view">
      <header className="pagehead noprint">
        <div>
          <p className="kicker">For the head teacher’s file</p>
          <h1>Reports</h1>
        </div>
        <button type="button" className="btn solid" onClick={() => window.print()}>
          Print
        </button>
      </header>
      <div className="seg noprint" role="tablist" aria-label="Report">
        <button type="button" className={nav.reportTab === 'daily' ? 'chip on' : 'chip'} onClick={() => nav.setReportTab('daily')}>
          Daily
        </button>
        <button type="button" className={nav.reportTab === 'monthly' ? 'chip on' : 'chip'} onClick={() => nav.setReportTab('monthly')}>
          Monthly
        </button>
      </div>
      {nav.reportTab === 'monthly' ? <Monthly /> : <Daily />}
    </div>
  )
}

function ReportBrand({ title, detail }) {
  const { state } = useHazri()
  const school = schoolOf(state)
  return (
    <header className="report-head">
      <Logo />
      <div>
        <strong>{school.name}</strong>
        <span>{school.kind} · {school.area}</span>
      </div>
      <div className="report-meta">
        <b>{title}</b>
        <span>{detail}</span>
      </div>
    </header>
  )
}

function Daily() {
  const { state } = useHazri()
  const nav = useNav()
  const today = todayISO()
  const scope = scopeFor(state, today)
  const date = nav.reportDate
  const classIds = scope.role === 'head' ? CLASSES.map((item) => item.id) : [scope.classId].filter(Boolean)
  const summary = scope.role === 'head' ? summarizeSchool(state, date) : summarizeClass(state, date, scope.classId)
  const marks = dayMarks(state, date)

  if (!classIds.length) {
    return <p className="deck">The head teacher has not assigned a class.</p>
  }

  return (
    <article className="card sheet-report">
      <ReportBrand title="Daily attendance" detail={formatLong(date)} />
      <div className="noprint">
        <DayStepper value={date} today={today} onChange={nav.setReportDate} />
      </div>
      <section className="stats compact">
        <Mini label="Present" value={summary.present || 0} />
        <Mini label="Absent" value={summary.absent || 0} />
        <Mini label="Leave" value={summary.leave || 0} />
        <Mini label="Not marked" value={summary.unmarked || 0} />
      </section>
      {classIds.map((classId) => {
        const roster = classStudents(state, classId)
        const classSummary = summarizeClass(state, date, classId)
        return (
          <section key={classId} className="report-block">
            <div className="card-head">
              <h2>{classLabel(classId)}</h2>
              <span className="muted">
                {classSummary.marked ? `${classSummary.rate}% present` : 'Not started'} · {roster.length} on roll
              </span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Roll</th>
                    <th>Student</th>
                    <th>Father</th>
                    <th>Status</th>
                    <th>Parent mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((student) => (
                    <tr key={student.id} className={marks[student.id] === 'absent' ? 'watch' : ''}>
                      <td>{student.roll}</td>
                      <td>{student.name}</td>
                      <td>{student.father}</td>
                      <td><Tag status={marks[student.id]} /></td>
                      <td>{phoneOf(state, student)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
      <p className="fine">Office {schoolPhone(state)} · Prepared in Hazri · Sundays are not school days.</p>
    </article>
  )
}

function Monthly() {
  const { state } = useHazri()
  const nav = useNav()
  const today = todayISO()
  const scope = scopeFor(state, today)
  const month = nav.reportMonth
  const classId = scope.role === 'head' ? null : scope.classId
  const rates = classMonthRates(state, month).filter((item) => !classId || item.id === classId)
  const rows = classId ? monthStudentRows(state, month, classId) : monthStudentRows(state, month)
  const school = schoolOf(state)
  const monthName = new Date(`${month}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  if (scope.role !== 'head' && !classId) {
    return <p className="deck">The head teacher has not assigned a class.</p>
  }

  return (
    <article className="card sheet-report">
      <ReportBrand title="Monthly attendance" detail={monthName} />
      <div className="tools noprint">
        <label className="field inline">
          Month
          <input
            type="month"
            value={month}
            max={today.slice(0, 7)}
            onChange={(event) => nav.setReportMonth(event.target.value)}
          />
        </label>
      </div>
      <p className="note">
        {school.id === 'pef42'
          ? 'Partner schools are reviewed on monthly attendance. Students under 80% are flagged so the office can talk to the family.'
          : 'Students under 80% are flagged so the office can talk to the family.'}
      </p>
      {rates.every((item) => item.marked === 0) ? (
        <p>No attendance has been recorded in {monthName}.</p>
      ) : (
        <div className="bars" aria-label="Attendance by class">
          {rates.map((item) => (
            <div key={item.id} className="barline">
              <span>{item.name}</span>
              <span className="track">
                <i className={item.marked && item.rate < 80 ? 'low' : 'ok'} style={{ width: `${item.marked ? item.rate : 0}%` }} />
              </span>
              <b>{item.marked ? `${item.rate}%` : '—'}</b>
            </div>
          ))}
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              {scope.role === 'head' && <th>Class</th>}
              <th>Present</th>
              <th>Absent</th>
              <th>Leave</th>
              <th>Rate</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const kind = band(row.rate, row.marked)
              return (
                <tr key={row.student.id} className={kind === 'watch' ? 'watch' : ''}>
                  <td>{row.student.name}</td>
                  {scope.role === 'head' && <td>{classLabel(row.student.classId)}</td>}
                  <td>{row.present}</td>
                  <td>{row.absent}</td>
                  <td>{row.leave}</td>
                  <td>{row.marked ? `${row.rate}%` : '—'}</td>
                  <td>{bandLabel(kind)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="fine">Office {school.phone} · Prepared in Hazri · Sundays are not school days. Lowest attendance is listed first. The rate counts only marked school days, so an empty register does not lower a child’s percentage.</p>
    </article>
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

function schoolPhone(state) {
  return schoolOf(state).phone
}
