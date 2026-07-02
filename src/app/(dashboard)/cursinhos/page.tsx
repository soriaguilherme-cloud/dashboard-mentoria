import { mockPrepCourses, mockStudents } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, GraduationCap, Users } from 'lucide-react'

export default function CursinhosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cursinhos Preparatórios"
        description="Cursinhos cadastrados e alunos vinculados"
        action={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Novo Cursinho</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockPrepCourses.map(course => {
          const students = mockStudents.filter(s => s.prep_course_id === course.id)
          return (
            <Card key={course.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{course.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{course.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{students.length}</span>
                  <span className="text-muted-foreground">aluno{students.length !== 1 ? 's' : ''}</span>
                </div>
                {students.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {students.map(s => (
                      <span key={s.id} className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                        {s.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
