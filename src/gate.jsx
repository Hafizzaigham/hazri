import { Avatar } from './bits.jsx'
import { classLabel } from './data.js'
import { RegisterArt, Logo } from './icons.jsx'
import { firstName, pct, todayISO } from './lib.js'
import { useNav } from './nav.jsx'
import { assignmentFor, classMonthRates, people, schoolOf, staffMarks } from './select.js'
import { useHazri } from './store.jsx'

export function Gate() {
  const { state, storageMode, chooseSchool, enter, reset } = useHazri()
  const nav = useNav()
  const school = schoolOf(state)
  const roster = people(state)
  const head = roster.find((person) => person.role === 'head')
  const teachers = roster.filter((person) => person.role === 'teacher')
  const sub = roster.find((person) => person.role === 'substitute')
  const today = todayISO()
  const job = sub ? assignmentFor(state, today, sub.id) : null
  const coverStatus = job ? staffMarks(state, today)[job.teacher.id] : null
  const monthRows = classMonthRates(state, today.slice(0, 7))
  const present = monthRows.reduce((sum, row) => sum + row.present, 0)
  const marked = monthRows.reduce((sum, row) => sum + row.marked, 0)
  const rate = pct(present, marked)

  function openAs(personId) {
    enter(personId)
    nav.home()
  }

  return (
    <div className="gate ruled">
      <header className="gate-top">
        <Logo />
        <button type="button" className="btn quiet" onClick={reset}>
          Reset demo
        </button>
      </header>

      <section className="gate-hero">
        <div className="gate-copy">
          <p className="kicker">Digital attendance for schools</p>
          <h1>The morning register, in one tap.</h1>
          <p className="lede">
            Hazri replaces the paper attendance book for private schools and PEF partner schools.
            Mark present, absent, or leave. The head teacher sees the whole school. Parents get a WhatsApp or a call.
          </p>
          <div className="schools" role="radiogroup" aria-label="Choose a demo school">
            <button
              type="button"
              className={state.schoolId === 'alnoor' ? 'school on' : 'school'}
              aria-pressed={state.schoolId === 'alnoor'}
              onClick={() => chooseSchool('alnoor')}
            >
              <span className="eyebrow">Private school</span>
              <strong>Al-Noor Public School</strong>
              <em>Model Town, Lahore</em>
            </button>
            <button
              type="button"
              className={state.schoolId === 'pef42' ? 'school on' : 'school'}
              aria-pressed={state.schoolId === 'pef42'}
              onClick={() => chooseSchool('pef42')}
            >
              <span className="eyebrow">PEF outsource</span>
              <strong>GPS Chak No. 42</strong>
              <em>Kasur · partner school</em>
            </button>
          </div>
        </div>
        <div className="gate-art">
          <RegisterArt />
          <div className="art-caption">
            <strong>{rate}%</strong>
            <span>present this month at {school.name}. Today’s register is still open.</span>
          </div>
        </div>
      </section>

      <h2 className="gate-label">Enter the demo as someone at {school.name}</h2>
      <section className="roles">
        <article className="role-card">
          <p className="eyebrow">Whole school</p>
          <h3>Head teacher</h3>
          <p>Dashboard, every class, staff attendance, and both reports.</p>
          <button type="button" className="btn solid wide" onClick={() => openAs(head.id)}>
            Continue as {head.name}
          </button>
        </article>

        <article className="role-card">
          <p className="eyebrow">One class</p>
          <h3>Class teachers</h3>
          <div className="person-list">
            {teachers.map((teacher) => (
              <button key={teacher.id} type="button" className="person-btn" onClick={() => openAs(teacher.id)}>
                <Avatar name={teacher.name} id={teacher.id} size={36} />
                <span>
                  <b>{teacher.name}</b>
                  <small>{classLabel(teacher.classId)}</small>
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="role-card">
          <p className="eyebrow">Cover only</p>
          <h3>Substitute</h3>
          {job ? (
            <p>
              {firstName(sub.name)} is covering {classLabel(job.classId)} because {job.teacher.name} is {coverStatus === 'absent' ? 'absent' : 'on leave'}.
              Other classes stay hidden.
            </p>
          ) : (
            <p>No class is assigned today. The head teacher can assign one from Staff.</p>
          )}
          <button type="button" className="btn wide" onClick={() => openAs(sub.id)}>
            Continue as {sub.name}
          </button>
        </article>
      </section>

      <ol className="script">
        <li>
          <span>01</span>
          Open as the head teacher and read the school at a glance.
        </li>
        <li>
          <span>02</span>
          Mark a class present, absent, or leave in one tap.
        </li>
        <li>
          <span>03</span>
          Alert a parent with your own number, then send the WhatsApp.
        </li>
        <li>
          <span>04</span>
          Sign out and enter as the substitute. Only the covered class is there.
        </li>
      </ol>
      <p className="fine">
        The sample 0300 numbers are not real parents.
        {' '}
        {storageMode === 'shared'
          ? 'Marks are saved in the free database, so a phone and a laptop see the same register.'
          : storageMode === 'offline'
            ? 'The shared database is not connected yet. Data stays in this browser.'
            : 'Data stays in this browser.'}
      </p>
    </div>
  )
}
