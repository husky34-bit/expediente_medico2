/**
 * Mock data helpers for doctor interface.
 * Generates deterministic data from patient IDs.
 */

function hashId(id) {
  if (!id) return 0
  return String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

export function getPatientStatus(id) {
  const h = hashId(id)
  const statuses = ['STABLE', 'STABLE', 'RECOVERING', 'STABLE', 'CRITICAL', 'RECOVERING']
  return statuses[h % statuses.length]
}

export function getPatientVitals(id) {
  const h = hashId(id)
  return {
    heartRate: 68 + (h % 32),
    temperature: (36 + (h % 15) / 10).toFixed(1),
    glucose: 80 + (h % 60),
  }
}

export function getPatientDisease(patient) {
  if (patient?.alergias) {
    const first = patient.alergias.split(/[,:]/)[0].trim()
    if (first) return first
  }
  const diseases = ['Diabetes', 'Hypertension', 'Asthma', 'Migraine', 'Arthritis', 'Thyroid']
  return diseases[hashId(patient?.id) % diseases.length]
}

export const statusConfig = {
  STABLE: {
    bg: 'bg-emerald-50', text: 'text-emerald-600',
    border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'STABLE',
  },
  RECOVERING: {
    bg: 'bg-amber-50', text: 'text-amber-600',
    border: 'border-amber-200', dot: 'bg-amber-500', label: 'RECOVERING',
  },
  CRITICAL: {
    bg: 'bg-red-50', text: 'text-red-600',
    border: 'border-red-200', dot: 'bg-red-500', label: 'CRITICAL',
  },
}

export function getDoctorName(email) {
  if (!email) return 'Doctor'
  const local = email.split('@')[0]
  return 'Dr. ' + local.charAt(0).toUpperCase() + local.slice(1).replace(/[0-9]/g, '')
}

export function getInitials(name) {
  if (!name) return '??'
  return name.split(' ').slice(0, 2).map(n => n?.[0] || '').join('').toUpperCase()
}

export function generateSchedule(patients) {
  if (!patients || patients.length === 0) return []
  const today = new Date()
  const reasons = ['Routine check', 'Follow-up', 'Lab results', 'Prescription renewal', 'Consultation', 'Check-up']
  return patients.map((p, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    date.setHours(9 + (i * 2) % 8, i % 2 === 0 ? 0 : 30, 0, 0)
    return {
      id: p.id, patient: p, date,
      time: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
      reason: `${reasons[i % reasons.length]} · ${getPatientDisease(p)}`,
      status: getPatientStatus(p.id),
    }
  })
}

export function getBloodTypeLabel(bt) {
  if (!bt) return null
  const positive = bt.includes('+')
  return { type: bt.replace(/[+-]/, ''), sign: positive ? '(Positive)' : '(Negative)' }
}
