import { CLASSES, SCHOOLS, classLabel, peopleBySchool, studentsBySchool } from './data.js'
import { eachDateInMonth, isSunday, pct, previousSchoolDay, tally, todayISO } from './lib.js'

export function schoolOf(state) {
  return SCHOOLS.find((school) => school.id === state.schoolId) || SCHOOLS[0]
}

export function people(state) {
  return peopleBySchool[state.schoolId] || []
}

export function students(state) {
  return studentsBySchool[state.schoolId] || []
}

export function personById(state, id) {
  return people(state).find((person) => person.id === id) || null
}

export function studentById(state, id) {
  return students(state).find((student) => student.id === id) || null
}

export function classTeacher(state, classId) {
  return people(state).find((person) => person.role === 'teacher' && person.classId === classId) || null
}

export function substitutes(state) {
  return people(state).filter((person) => person.role === 'substitute')
}

export function teachers(state) {
  return people(state).filter((person) => person.role === 'teacher')
}

export function phoneOf(state, student) {
  return state.phones?.[student.id] || student.phone
}

export function dayMarks(state, date) {
  return state.attendance?.[state.schoolId]?.[date] || {}
}

export function staffMarks(state, date) {
  return state.staff?.[state.schoolId]?.[date] || {}
}

export function coverMap(state, date) {
  return state.cover?.[state.schoolId]?.[date] || {}
}

export function classStudents(state, classId) {
  return students(state)
    .filter((student) => student.classId === classId)
    .sort((a, b) => a.roll - b.roll)
}

export function summarizeClass(state, date, classId) {
  const roster = classStudents(state, classId)
  const marks = dayMarks(state, date)
  return {
    ...tally(roster.map((student) => marks[student.id] || null)),
    total: roster.length,
  }
}

export function summarizeSchool(state, date) {
  const marks = dayMarks(state, date)
  const roster = students(state)
  return {
    ...tally(roster.map((student) => marks[student.id] || null)),
    total: roster.length,
  }
}

export function substituteFor(state, date, teacherId) {
  const id = coverMap(state, date)[teacherId]
  return id ? personById(state, id) : null
}

export function assignmentFor(state, date, substituteId) {
  const map = coverMap(state, date)
  const teacherId = Object.keys(map).find((key) => map[key] === substituteId)
  if (!teacherId) return null
  const teacher = personById(state, teacherId)
  if (!teacher?.classId) return null
  return { teacher, classId: teacher.classId }
}

export function scopeFor(state, date) {
  const session = state.session
  if (!session) return { role: null, classId: null, person: null, covering: null }
  const person = personById(state, session.personId)
  if (!person) return { role: null, classId: null, person: null, covering: null }
  if (person.role === 'head') return { role: 'head', classId: null, person, covering: null }
  if (person.role === 'teacher') {
    return { role: 'teacher', classId: person.classId, person, covering: null }
  }
  const job = assignmentFor(state, date, person.id)
  return {
    role: 'substitute',
    classId: job?.classId || null,
    person,
    covering: job?.teacher || null,
  }
}

export function canOpenClass(state, date, classId) {
  const scope = scopeFor(state, date)
  if (scope.role === 'head') return true
  return Boolean(classId) && scope.classId === classId
}

export function monthStudentRows(state, month, classId) {
  const today = todayISO()
  const days = eachDateInMonth(month).filter((day) => !isSunday(day) && day <= today)
  const roster = classId ? classStudents(state, classId) : students(state)
  return roster
    .map((student) => {
      const statuses = days.map((day) => dayMarks(state, day)[student.id] || null)
      return { student, ...tally(statuses) }
    })
    .sort((a, b) => {
      if (!a.marked && !b.marked) return a.student.name.localeCompare(b.student.name)
      if (!a.marked) return 1
      if (!b.marked) return -1
      return a.rate - b.rate || a.student.name.localeCompare(b.student.name)
    })
}

export function classMonthRates(state, month) {
  const today = todayISO()
  const days = eachDateInMonth(month).filter((day) => !isSunday(day) && day <= today)
  return CLASSES.map((item) => {
    const roster = classStudents(state, item.id)
    const statuses = []
    for (const day of days) {
      const marks = dayMarks(state, day)
      for (const student of roster) statuses.push(marks[student.id] || null)
    }
    const summary = tally(statuses)
    return { ...item, ...summary }
  })
}

export function sparkRates(state, month) {
  const today = todayISO()
  return eachDateInMonth(month)
    .filter((day) => !isSunday(day) && day <= today)
    .map((day) => {
      const summary = summarizeSchool(state, day)
      return { day, rate: summary.marked ? summary.rate : null }
    })
    .filter((point) => point.rate !== null)
}

export function studentHistory(state, studentId, month) {
  const today = todayISO()
  return eachDateInMonth(month)
    .filter((day) => day <= today)
    .map((day) => ({
      day,
      sunday: isSunday(day),
      status: isSunday(day) ? null : dayMarks(state, day)[studentId] || null,
    }))
}

export function alertsFor(state) {
  return [...(state.alerts?.[state.schoolId] || [])].sort((a, b) => (a.at < b.at ? 1 : -1))
}

export function wasAlerted(state, studentId, date, channel) {
  return (state.alerts?.[state.schoolId] || []).some(
    (alert) => alert.studentId === studentId && alert.date === date && (!channel || alert.channel === channel),
  )
}

export function absentees(state, date, classId) {
  const marks = dayMarks(state, date)
  return (classId ? classStudents(state, classId) : students(state)).filter((student) => {
    const status = marks[student.id]
    return status === 'absent' || status === 'leave'
  })
}

export function watchList(state, month) {
  return monthStudentRows(state, month).filter((row) => row.marked > 0 && row.rate < 80)
}

export function roleLabel(scope) {
  if (!scope?.person) return ''
  if (scope.role === 'head') return 'Head teacher'
  if (scope.role === 'substitute') return 'Substitute'
  return 'Class teacher'
}

export function yesterdayOf(date) {
  return previousSchoolDay(date)
}

export function band(rate, marked) {
  if (!marked) return 'empty'
  if (rate < 80) return 'watch'
  if (rate < 90) return 'fair'
  return 'good'
}

export function bandLabel(kind) {
  if (kind === 'watch') return 'Under 80%'
  if (kind === 'fair') return 'Fair (80–89)'
  if (kind === 'good') return 'Strong (90 and above)'
  return 'No record'
}

export { classLabel, CLASSES, pct, todayISO }
