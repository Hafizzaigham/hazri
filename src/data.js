import { pastSchoolDays, todayISO } from './lib.js'

export const CLASSES = [
  { id: 'nursery', name: 'Nursery', order: 0 },
  { id: 'one', name: 'Class 1', order: 1 },
  { id: 'two', name: 'Class 2', order: 2 },
  { id: 'three', name: 'Class 3', order: 3 },
  { id: 'four', name: 'Class 4', order: 4 },
  { id: 'five', name: 'Class 5', order: 5 },
]

export const SCHOOLS = [
  {
    id: 'alnoor',
    kind: 'Private school',
    name: 'Al-Noor Public School',
    area: 'Model Town, Lahore',
    phone: '042-000-2210',
    motto: 'A register the whole staff can trust',
  },
  {
    id: 'pef42',
    kind: 'PEF partner school',
    name: 'GPS Chak No. 42',
    area: 'Kasur · PEF outsource',
    phone: '049-000-4210',
    motto: 'Every enrolled child, counted every morning',
  },
]

const PEOPLE = {
  alnoor: {
    head: ['farzana', 'Farzana Malik'],
    teachers: [
      ['sana', 'Sana Iqbal', 'nursery'],
      ['hina', 'Hina Khalid', 'one'],
      ['bilal', 'Bilal Ahmed', 'two'],
      ['maria', 'Maria Yousaf', 'three'],
      ['ayesha', 'Ayesha Rahman', 'four'],
      ['usman', 'Usman Tariq', 'five'],
    ],
    sub: ['imran', 'Imran Saleem'],
  },
  pef42: {
    head: ['akram', 'Muhammad Akram'],
    teachers: [
      ['shabnam', 'Shabnam Bibi', 'nursery'],
      ['khalida', 'Khalida Parveen', 'one'],
      ['riaz', 'Riaz Ahmed', 'two'],
      ['naseem', 'Naseem Akhtar', 'three'],
      ['farah', 'Farah Naz', 'four'],
      ['mustafa', 'Ghulam Mustafa', 'five'],
    ],
    sub: ['asif', 'Asif Ali'],
  },
}

const CITY = [
  'House 12, Model Town',
  'Street 4, Garden Town',
  'Block C, Johar Town',
  'Askari 11, Lahore',
  'Wapda Town, Lahore',
]

const VILLAGE = [
  'Chak No. 42',
  'Basti Rehman, Chak 42',
  'Kot Haleem',
  'Chak 42, near the mosque',
  'Basti Kamal',
]

const ROWS = {
  alnoor: [
    ['nursery', 'Ibrahim Ali', 'Muhammad Ali'],
    ['nursery', 'Aiza Fatima', 'Kamran Shah'],
    ['nursery', 'Hamza Nadeem', 'Nadeem Akhtar'],
    ['nursery', 'Hoorain Imran', 'Imran Qureshi'],
    ['nursery', 'Zayan Ahmed', 'Ahmed Raza'],
    ['one', 'Anaya Hassan', 'Hassan Raza'],
    ['one', 'Rayyan Siddiqui', 'Owais Siddiqui'],
    ['one', 'Maira Javed', 'Javed Iqbal'],
    ['one', 'Abdullah Khan', 'Sohail Khan'],
    ['one', 'Eshaal Tariq', 'Tariq Mahmood'],
    ['two', 'Muhammad Umar', 'Muhammad Saeed'],
    ['two', 'Hania Shahid', 'Shahid Mehmood'],
    ['two', 'Ali Zafar', 'Zafar Iqbal'],
    ['two', 'Inaya Salman', 'Salman Ahmed'],
    ['two', 'Huzaifa Bilal', 'Bilal Hussain', true],
    ['three', 'Fatima Noor', 'Noor Ahmed'],
    ['three', 'Saad Jameel', 'Jameel Ahmed'],
    ['three', 'Zoya Ahmed', 'Ahmed Hassan'],
    ['three', 'Ibrahim Farooq', 'Farooq Azam'],
    ['three', 'Ayesha Kamal', 'Kamal Ahmed'],
    ['four', 'Ali Hassan', 'Muhammad Hassan'],
    ['four', 'Mahnoor Asif', 'Asif Mahmood'],
    ['four', 'Hassan Raza', 'Raza Hussain'],
    ['four', 'Laiba Younas', 'Younas Ali'],
    ['four', 'Omar Farooq', 'Farooq Ahmed'],
    ['five', 'Muhammad Bilal', 'Muhammad Aslam'],
    ['five', 'Hira Shah', 'Shahid Ali'],
    ['five', 'Daniyal Ahmed', 'Ahmed Nawaz'],
    ['five', 'Sana Khalid', 'Khalid Mehmood'],
    ['five', 'Abdul Rehman', 'Abdul Hameed', true],
  ],
  pef42: [
    ['nursery', 'Amina Bibi', 'Allah Ditta'],
    ['nursery', 'Muhammad Usman', 'Muhammad Boota'],
    ['nursery', 'Iqra Bibi', 'Bashir Ahmed'],
    ['nursery', 'Ali Raza', 'Muhammad Aslam'],
    ['nursery', 'Noor Fatima', 'Shabbir Hussain'],
    ['one', 'Muhammad Ahmad', 'Muhammad Sharif'],
    ['one', 'Sana Bibi', 'Muhammad Yousaf'],
    ['one', 'Hassan Ali', 'Ghulam Nabi'],
    ['one', 'Khadija Bibi', 'Muhammad Rafique'],
    ['one', 'Bilal Hussain', 'Muhammad Hussain'],
    ['two', 'Muhammad Waqas', 'Muhammad Latif'],
    ['two', 'Bushra Bibi', 'Muhammad Anwar'],
    ['two', 'Imran Ali', 'Muhammad Siddique'],
    ['two', 'Rabia Bibi', 'Muhammad Ashraf'],
    ['two', 'Adeel Ahmed', 'Muhammad Mansha', true],
    ['three', 'Muhammad Naveed', 'Muhammad Akbar'],
    ['three', 'Asma Bibi', 'Muhammad Ramzan'],
    ['three', 'Shahzad Ali', 'Muhammad Tufail'],
    ['three', 'Samina Bibi', 'Muhammad Yaqoob'],
    ['three', 'Faisal Iqbal', 'Muhammad Iqbal'],
    ['four', 'Muhammad Arslan', 'Muhammad Saleem'],
    ['four', 'Nadia Bibi', 'Muhammad Ameen'],
    ['four', 'Kashif Ali', 'Muhammad Hanif'],
    ['four', 'Saima Bibi', 'Muhammad Saeed'],
    ['four', 'Usman Ghani', 'Abdul Ghani'],
    ['five', 'Muhammad Irfan', 'Muhammad Sharif'],
    ['five', 'Farzana Bibi', 'Muhammad Din'],
    ['five', 'Rizwan Ali', 'Muhammad Aslam'],
    ['five', 'Shazia Bibi', 'Muhammad Nazir'],
    ['five', 'Tariq Mehmood', 'Muhammad Mehmood', true],
  ],
}

function buildPeople(schoolId, spec) {
  const head = {
    id: `${schoolId}-${spec.head[0]}`,
    name: spec.head[1],
    role: 'head',
    title: 'Head teacher',
    classId: null,
  }
  const teachers = spec.teachers.map(([key, name, classId]) => ({
    id: `${schoolId}-${key}`,
    name,
    role: 'teacher',
    title: 'Class teacher',
    classId,
  }))
  const sub = {
    id: `${schoolId}-${spec.sub[0]}`,
    name: spec.sub[1],
    role: 'substitute',
    title: 'Substitute teacher',
    classId: null,
  }
  return [head, ...teachers, sub]
}

function buildStudents(schoolId, prefix, rows) {
  const rolls = {}
  const places = schoolId === 'alnoor' ? CITY : VILLAGE
  return rows.map((row, index) => {
    const [classId, name, father, risk] = row
    rolls[classId] = (rolls[classId] || 0) + 1
    const n = String(101 + index).padStart(4, '0')
    return {
      id: `${schoolId}-s${index + 1}`,
      name,
      father,
      classId,
      roll: rolls[classId],
      phone: `0300-000${n}`,
      admission: `${prefix}-${2401 + index}`,
      address: places[index % places.length],
      joined: index % 7 === 0 ? 'April 2024' : 'April 2025',
      risk: Boolean(risk),
    }
  })
}

export const peopleBySchool = {
  alnoor: buildPeople('alnoor', PEOPLE.alnoor),
  pef42: buildPeople('pef42', PEOPLE.pef42),
}

export const studentsBySchool = {
  alnoor: buildStudents('alnoor', 'AN', ROWS.alnoor),
  pef42: buildStudents('pef42', 'PEF', ROWS.pef42),
}

export function classById(classId) {
  return CLASSES.find((item) => item.id === classId) || null
}

export function classLabel(classId) {
  return classById(classId)?.name || 'Class'
}

export const STORAGE_KEY = 'hazri-demo-v3'
export const DATA_VERSION = 3

function plannedMarks(studs, days) {
  const yesterday = days[days.length - 1]
  const months = new Map()
  for (const day of days) {
    const key = day.slice(0, 7)
    if (!months.has(key)) months.set(key, [])
    months.get(key).push(day)
  }
  const out = {}
  for (const student of studs) out[student.id] = {}
  for (const monthDays of months.values()) {
    const count = monthDays.length
    const budget = Math.floor(count * 0.2)
    for (const student of studs) {
      if (student.risk) {
        monthDays.forEach((day, index) => {
          if (index === count - 1) out[student.id][day] = 'absent'
          else if (index % 4 === 2) out[student.id][day] = 'leave'
          else if (index % 2 === 0) out[student.id][day] = 'absent'
          else out[student.id][day] = 'present'
        })
        continue
      }
      for (const day of monthDays) out[student.id][day] = 'present'
      let misses = 0
      const awayYesterday = budget >= 1
        && monthDays[count - 1] === yesterday
        && student.roll === 1
        && (student.classId === 'nursery' || student.classId === 'two' || student.classId === 'four')
      if (awayYesterday) {
        out[student.id][yesterday] = 'absent'
        misses += 1
      }
      if (misses < budget && student.roll === 3 && count > 1) {
        const leaveDay = monthDays[1]
        if (out[student.id][leaveDay] === 'present') out[student.id][leaveDay] = 'leave'
      }
    }
  }
  return out
}

export function hydrate(base) {
  const today = todayISO()
  const days = pastSchoolDays(today, 18)
  const attendance = structuredClone(base.attendance || {})
  const staff = structuredClone(base.staff || {})
  const cover = structuredClone(base.cover || {})
  const alerts = structuredClone(base.alerts || {})

  for (const school of SCHOOLS) {
    attendance[school.id] = attendance[school.id] || {}
    staff[school.id] = staff[school.id] || {}
    cover[school.id] = cover[school.id] || {}
    alerts[school.id] = alerts[school.id] || []

    const studs = studentsBySchool[school.id]
    const teachers = peopleBySchool[school.id].filter((person) => person.role === 'teacher')
    const sub = peopleBySchool[school.id].find((person) => person.role === 'substitute')
    const classFour = teachers.find((person) => person.classId === 'four')
    const plan = plannedMarks(studs, days)

    days.forEach((day, dayIndex) => {
      if (!attendance[school.id][day]) {
        const map = {}
        for (const student of studs) map[student.id] = plan[student.id][day]
        attendance[school.id][day] = map
      }
      if (!staff[school.id][day]) {
        const map = {}
        for (const teacher of teachers) {
          const order = CLASSES.findIndex((item) => item.id === teacher.classId)
          map[teacher.id] = (dayIndex + order) % 8 === 0 ? 'late' : 'present'
        }
        staff[school.id][day] = map
      }
    })

    if (!staff[school.id][today]) {
      const map = {}
      for (const teacher of teachers) {
        map[teacher.id] = teacher.classId === 'four' ? 'leave' : 'present'
      }
      staff[school.id][today] = map
      cover[school.id][today] = { [classFour.id]: sub.id }
    }

    if (alerts[school.id].length === 0) {
      const yesterday = days[days.length - 1]
      const marked = attendance[school.id][yesterday] || {}
      const absentees = studs.filter((student) => marked[student.id] === 'absent').slice(0, 3)
      alerts[school.id] = absentees.map((student) => ({
        id: `seed-${student.id}-${yesterday}`,
        studentId: student.id,
        date: yesterday,
        channel: 'whatsapp',
        at: `${yesterday}T08:35:00`,
      }))
    }
  }

  return {
    version: DATA_VERSION,
    schoolId: base.schoolId || 'alnoor',
    session: base.session || null,
    phones: base.phones || {},
    attendance,
    staff,
    cover,
    alerts,
  }
}

export function freshState(schoolId = 'alnoor') {
  return hydrate({
    version: DATA_VERSION,
    schoolId,
    session: null,
    phones: {},
    attendance: {},
    staff: {},
    cover: {},
    alerts: {},
  })
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.version === DATA_VERSION) return hydrate(parsed)
    }
    localStorage.removeItem('hazri-demo-v1')
  } catch {
    /* start clean */
  }
  return freshState()
}
