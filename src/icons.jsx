export function Logo({ tone = 'dark' }) {
  const onDark = tone === 'light'
  return (
    <div className={`brand ${onDark ? 'on-dark' : ''}`}>
      <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
        <rect width="36" height="36" rx="11" fill={onDark ? '#f3ecdf' : '#13261c'} />
        <path d="M8 12h20M8 18h12M8 24h16" stroke={onDark ? '#13261c' : '#f3ecdf'} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M21 16.2l3.2 3.2 6.3-7" fill="none" stroke="#2f9e62" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <strong>Hazri</strong>
        <em>حاضری</em>
      </div>
    </div>
  )
}

export function Icon({ name }) {
  const paths = {
    today: (
      <>
        <path d="M5 10h14" />
        <path d="M8 4v3M16 4v3" />
        <rect x="4" y="7" width="16" height="13" rx="2" />
      </>
    ),
    register: (
      <>
        <path d="M5 7h9" />
        <path d="M5 12h14" />
        <path d="M5 17h8" />
        <path d="M15 6.5l1.8 1.8 3.7-4" />
      </>
    ),
    students: (
      <>
        <circle cx="9" cy="8" r="2.6" />
        <path d="M4.2 18c.5-2.8 2.4-4.2 4.8-4.2s4.3 1.4 4.8 4.2" />
        <circle cx="16.2" cy="9" r="2.1" />
        <path d="M15 13.8c1.8.2 3.2 1.3 3.8 3.8" />
      </>
    ),
    reports: (
      <>
        <path d="M5 18V8" />
        <path d="M10 18V5" />
        <path d="M15 18v-6" />
        <path d="M20 18V9" />
      </>
    ),
    staff: (
      <>
        <circle cx="12" cy="8" r="2.7" />
        <path d="M6 18.5c.7-3 2.8-4.6 6-4.6s5.3 1.6 6 4.6" />
      </>
    ),
    back: <path d="M15 6l-6 6 6 6M9 12h10" />,
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

export function RegisterArt() {
  const rows = [
    { kind: 'ok', width: 88 },
    { kind: 'ok', width: 76 },
    { kind: 'ok', width: 96 },
    { kind: 'ok', width: 70 },
    { kind: 'leave', width: 84 },
    { kind: 'absent', width: 64 },
  ]
  return (
    <svg className="art" viewBox="0 0 640 500" role="img" aria-label="An open class register beside a phone ready to message a parent">
      <rect width="640" height="500" rx="32" fill="#e5f3ea" />
      <circle cx="568" cy="64" r="40" fill="#d5eddc" />
      <circle cx="70" cy="438" r="42" fill="#d5eddc" />
      <g fill="#1c7a4a">
        <ellipse cx="92" cy="64" rx="18" ry="8" transform="rotate(-35 92 64)" />
        <ellipse cx="114" cy="72" rx="18" ry="8" transform="rotate(25 114 72)" />
      </g>
      <g transform="translate(28,64)">
        <rect x="8" y="28" width="196" height="300" rx="16" fill="#fffdf8" />
        <rect x="190" y="16" width="200" height="312" rx="16" fill="#fffdf8" />
        <rect x="184" y="16" width="16" height="312" fill="#eadfcb" />
        <text x="36" y="72" fill="#6f675e" fontSize="13" fontFamily="Outfit, Segoe UI, sans-serif" letterSpacing="1.2">
          SCHOOL ROLL
        </text>
        {[0, 1, 2, 3, 4].map((index) => (
          <g key={`left-${index}`} transform={`translate(36, ${108 + index * 40})`}>
            <circle cx="0" cy="0" r="10" fill="#d9f0e3" />
            <path d="M-4 0l2.6 2.8L5 -4" fill="none" stroke="#1c7a4a" strokeWidth="2" strokeLinecap="round" />
            <rect x="20" y="-5" width={108 - index * 8} height="10" rx="5" fill="#efe6d6" />
          </g>
        ))}
        <text x="214" y="52" fill="#6f675e" fontSize="12" fontFamily="Outfit, Segoe UI, sans-serif" letterSpacing="1.2">
          CLASS 4 · MORNING
        </text>
        {rows.map((row, index) => (
          <g key={index} transform={`translate(214, ${86 + index * 36})`}>
            <circle cx="0" cy="0" r="11" fill={row.kind === 'ok' ? '#d9f0e3' : row.kind === 'leave' ? '#f8e7c3' : '#f8d6d3'} />
            {row.kind === 'absent' ? (
              <path d="M-4 -4l8 8M4 -4l-8 8" fill="none" stroke="#b42318" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M-5 0l3.2 3.2L5 -5" fill="none" stroke={row.kind === 'leave' ? '#a16207' : '#1c7a4a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}
            <rect x="22" y="-5" width={row.width} height="10" rx="5" fill="#efe6d6" />
          </g>
        ))}
      </g>
      <g transform="translate(456,132)">
        <rect x="8" y="12" width="156" height="248" rx="26" fill="rgba(19,38,28,0.12)" />
        <rect width="156" height="248" rx="26" fill="#13261c" />
        <rect x="12" y="28" width="132" height="198" rx="16" fill="#f6f1e7" />
        <rect x="64" y="12" width="40" height="7" rx="3.5" fill="#3e5649" />
        <rect x="26" y="52" width="116" height="86" rx="16" fill="#fffdf8" />
        <text x="38" y="84" fontSize="15" fontFamily="Outfit, Segoe UI, sans-serif" fontWeight="700" fill="#1b1712">
          Absent today
        </text>
        <text x="38" y="108" fontSize="13" fontFamily="Outfit, Segoe UI, sans-serif" fill="#6f675e">
          Ali · Class 4
        </text>
        <rect x="26" y="156" width="78" height="32" rx="16" fill="#1c7a4a" />
        <text x="40" y="177" fontSize="13" fontFamily="Outfit, Segoe UI, sans-serif" fill="#f6f1e7">
          WhatsApp
        </text>
        <rect x="112" y="156" width="32" height="32" rx="16" fill="#fffdf8" stroke="#e4dccb" />
        <path d="M122 172h12" stroke="#13261c" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M124 168c2-3 8-3 10 0" fill="none" stroke="#13261c" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  )
}
