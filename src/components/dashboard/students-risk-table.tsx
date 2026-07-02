'use client'

import Link from 'next/link'
import { Student } from '@/types/database'
import { StudentStatusBadge, RiskScore } from '@/components/shared/status-badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'

interface StudentsRiskTableProps {
  students: Student[]
  showMentor?: boolean
}

export function StudentsRiskTable({ students, showMentor = true }: StudentsRiskTableProps) {
  const sorted = [...students].sort((a, b) => b.risk_score - a.risk_score)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2 font-medium text-muted-foreground">Aluno</th>
            <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
            {showMentor && <th className="text-left py-3 px-2 font-medium text-muted-foreground">Mentor</th>}
            <th className="text-left py-3 px-2 font-medium text-muted-foreground">Última Reunião</th>
            <th className="text-left py-3 px-2 font-medium text-muted-foreground">Próxima Reunião</th>
            <th className="text-left py-3 px-2 font-medium text-muted-foreground">Risco</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((student) => (
            <tr key={student.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="py-3 px-2">
                <Link href={`/alunos/${student.id}`} className="font-medium text-foreground hover:text-primary hover:underline">
                  {student.name}
                </Link>
                <p className="text-xs text-muted-foreground">{student.desired_specialty}</p>
              </td>
              <td className="py-3 px-2">
                <StudentStatusBadge status={student.status} />
              </td>
              {showMentor && (
                <td className="py-3 px-2 text-muted-foreground text-xs">
                  {student.mentor?.name || '—'}
                </td>
              )}
              <td className="py-3 px-2">
                {student.last_meeting_at ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">
                      {format(new Date(student.last_meeting_at), "dd MMM", { locale: ptBR })}
                    </span>
                    {(student.days_since_last_meeting ?? 0) > 21 && (
                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-red-500 font-medium">Nunca</span>
                )}
              </td>
              <td className="py-3 px-2">
                {student.next_meeting_at ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs">
                      {format(new Date(student.next_meeting_at), "dd MMM", { locale: ptBR })}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Sem reunião
                  </span>
                )}
              </td>
              <td className="py-3 px-2">
                <RiskScore score={student.risk_score} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
