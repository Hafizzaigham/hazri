import { formatLong, hash, pct, stepSchoolDay } from './lib.js'

const COLORS = ['#1c7a4a', '#0f6b66', '#1d4e89', '#a15c38', '#8a3d4e', '#5c4d8a', '#3d5a40', '#8a5a12']

export function Avatar({ name, id, size = 44 }) {
  const bg = COLORS[hash(id || name) % COLORS.length]
  const initials = String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  return (
    <svg className="avatar" width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <rect width="44" height="44" rx="14" fill={bg} />
      <text x="22" y="28" textAnchor="middle" fontSize="14" fontFamily="Outfit, Segoe UI, sans-serif" fill="#fffdf8" fontWeight="700">
        {initials}
      </text>
    </svg>
  )
}

export function Donut({ present, absent, leave }) {
  const total = present + absent + leave
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const parts = [
    { key: 'present', value: present, color: '#1c7a4a' },
    { key: 'leave', value: leave, color: '#c48a12' },
    { key: 'absent', value: absent, color: '#b42318' },
  ].filter((part) => part.value > 0)
  let drawn = 0
  const label = total ? `${pct(present, total)} percent present` : 'Register not started'
  return (
    <svg className="donut" viewBox="0 0 140 140" role="img" aria-label={label}>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#efe6d6" strokeWidth="14" />
      {parts.map((part) => {
        const slice = (part.value / total) * circumference
        const gap = parts.length > 1 ? 2 : 0
        const len = Math.max(slice - gap, 0)
        const node = (
          <circle
            key={part.key}
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={part.color}
            strokeWidth="14"
            strokeDasharray={`${len} ${circumference - len}`}
            strokeDashoffset={-drawn}
            transform="rotate(-90 70 70)"
          />
        )
        drawn += slice
        return node
      })}
      <text x="70" y="68" textAnchor="middle" className="donut-num">
        {total ? `${pct(present, total)}%` : '—'}
      </text>
      <text x="70" y="88" textAnchor="middle" className="donut-sub">
        {total ? 'present' : 'not started'}
      </text>
    </svg>
  )
}

export function Spark({ points }) {
  const width = 320
  const height = 78
  if (!points || points.length < 2) return <p className="muted">Mark a few days to see the month.</p>
  const step = width / (points.length - 1)
  const coords = points.map((point, index) => {
    const x = index * step
    const y = height - 10 - (point.rate / 100) * (height - 20)
    return [x, y]
  })
  const d = coords.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${d} L${width},${height} L0,${height} Z`
  const last = coords[coords.length - 1]
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily attendance this month">
      <path d={area} fill="rgba(28,122,74,0.12)" />
      <path d={d} fill="none" stroke="#1c7a4a" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#13261c" />
    </svg>
  )
}

export function Empty({ title, text, action }) {
  return (
    <div className="empty">
      <svg viewBox="0 0 120 80" width="132" height="88" aria-hidden="true">
        <rect x="8" y="14" width="104" height="56" rx="12" fill="#fffdf8" stroke="#e4dccb" />
        <path d="M22 34h46M22 46h34M22 58h24" stroke="#e4dccb" strokeWidth="4" strokeLinecap="round" />
        <circle cx="88" cy="46" r="14" fill="#e5f4eb" />
        <path d="M82 46l4 4 8-9" fill="none" stroke="#1c7a4a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}

export function DayStepper({ value, today, onChange }) {
  return (
    <div className="stepper">
      <button type="button" className="btn" onClick={() => onChange(stepSchoolDay(value, -1, today))} aria-label="Previous school day">
        Back
      </button>
      <strong>{formatLong(value)}</strong>
      <button
        type="button"
        className="btn"
        disabled={value >= today}
        onClick={() => onChange(stepSchoolDay(value, 1, today))}
        aria-label="Next school day"
      >
        Next
      </button>
    </div>
  )
}

export function Tag({ status }) {
  const key = status || 'none'
  const label = status === 'present'
    ? 'Present'
    : status === 'absent'
      ? 'Absent'
      : status === 'leave'
        ? 'Leave'
        : status === 'late'
          ? 'Late'
          : 'Not marked'
  return <span className={`tag ${key}`}>{label}</span>
}
