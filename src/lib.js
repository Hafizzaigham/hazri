export function iso(d) {
  const dt = d instanceof Date ? d : new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISO(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO() {
  return iso(new Date())
}

export function addDays(value, amount) {
  const d = parseISO(value)
  d.setDate(d.getDate() + amount)
  return iso(d)
}

export function isSunday(value) {
  return parseISO(value).getDay() === 0
}

export function formatLong(value) {
  return parseISO(value).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShort(value) {
  return parseISO(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatWeekday(value) {
  return parseISO(value).toLocaleDateString('en-GB', { weekday: 'short' })
}

export function eachDateInMonth(month) {
  const [y, m] = month.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  const days = []
  for (let d = 1; d <= last; d += 1) days.push(iso(new Date(y, m - 1, d)))
  return days
}

export function pastSchoolDays(from, count) {
  const days = []
  let cursor = addDays(from, -1)
  while (days.length < count) {
    if (!isSunday(cursor)) days.push(cursor)
    cursor = addDays(cursor, -1)
  }
  return days.reverse()
}

export function stepSchoolDay(value, direction, today) {
  let cursor = addDays(value, direction)
  while (isSunday(cursor)) cursor = addDays(cursor, direction)
  if (cursor > today) return today
  return cursor
}

export function previousSchoolDay(value) {
  let cursor = addDays(value, -1)
  while (isSunday(cursor)) cursor = addDays(cursor, -1)
  return cursor
}

export function pct(part, total) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

export function tally(statuses) {
  const t = { present: 0, absent: 0, leave: 0, unmarked: 0 }
  for (const status of statuses) {
    if (status === 'present' || status === 'absent' || status === 'leave') t[status] += 1
    else t.unmarked += 1
  }
  t.marked = t.present + t.absent + t.leave
  t.rate = pct(t.present, t.marked)
  return t
}

export function hash(str) {
  let h = 0
  for (let i = 0; i < String(str).length; i += 1) h = (h * 31 + String(str).charCodeAt(i)) >>> 0
  return h
}

export function digitsPhone(phone) {
  let n = String(phone || '').replace(/\D/g, '')
  if (n.startsWith('00')) n = n.slice(2)
  if (n.startsWith('0')) n = `92${n.slice(1)}`
  if (!n.startsWith('92') && n.length === 10) n = `92${n}`
  return n
}

export function waLink(phone, text) {
  return `https://wa.me/${digitsPhone(phone)}?text=${encodeURIComponent(text)}`
}

export function telLink(phone) {
  return `tel:+${digitsPhone(phone)}`
}

export function parentMessage({ school, student, classLabel, dateLabel, status }) {
  const line = status === 'leave'
    ? `${student.name} (Roll ${student.roll}, ${classLabel}) is on leave on ${dateLabel}.`
    : `${student.name} (Roll ${student.roll}, ${classLabel}) is absent on ${dateLabel}.`
  return `Assalam o Alaikum,\n${line}\nSchool: ${school.name}.\nPlease reply or call the office if you would like to talk.\n— Hazri attendance`
}

export function firstName(full) {
  const parts = String(full || '').split(' ').filter(Boolean)
  if (parts[0] === 'Muhammad' && parts[1]) return parts[1]
  return parts[0] || 'there'
}

export function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function statusLabel(status) {
  if (status === 'present') return 'Present'
  if (status === 'absent') return 'Absent'
  if (status === 'leave') return 'Leave'
  if (status === 'late') return 'Late'
  return 'Not marked'
}
