'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'

const meetingsData = [
  { mes: 'Jan', realizadas: 22, agendadas: 5 },
  { mes: 'Fev', realizadas: 25, agendadas: 4 },
  { mes: 'Mar', realizadas: 28, agendadas: 6 },
  { mes: 'Abr', realizadas: 24, agendadas: 8 },
  { mes: 'Mai', realizadas: 30, agendadas: 3 },
  { mes: 'Jun', realizadas: 18, agendadas: 5 },
]

const statusData = [
  { name: 'Ativos', value: 5, color: '#10b981' },
  { name: 'Inativos', value: 1, color: '#f59e0b' },
  { name: 'Críticos', value: 2, color: '#ef4444' },
]

const studyPhaseData = [
  { name: 'Construção', value: 4, color: '#3b82f6' },
  { name: 'Consolidação', value: 2, color: '#8b5cf6' },
  { name: 'Manutenção', value: 2, color: '#6b7280' },
]

export function MeetingsChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={meetingsData} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="realizadas" name="Realizadas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="agendadas" name="Pendentes" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function StudentStatusPieChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={statusData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {statusData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs">{value}</span>}
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function StudyPhaseChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={studyPhaseData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {studyPhaseData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs">{value}</span>}
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
