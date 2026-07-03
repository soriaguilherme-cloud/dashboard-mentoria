'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { mockProfiles } from '@/lib/mock-data'
import { UserRole } from '@/types/database'
import { Stethoscope, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRoleHome, roleLabel } from '@/lib/access-control'

const roleColor: Record<UserRole, string> = {
  coordenacao: 'bg-orange-100 text-orange-700 border-orange-200',
  supervisor: 'bg-purple-100 text-purple-700 border-purple-200',
  mentor: 'bg-blue-100 text-blue-700 border-blue-200',
  orientador: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const roleAvatarBg: Record<UserRole, string> = {
  coordenacao: 'bg-orange-500',
  supervisor: 'bg-purple-500',
  mentor: 'bg-blue-500',
  orientador: 'bg-emerald-500',
}

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading, demoPassword, login, loginAs } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeProfile, setActiveProfile] = useState<string | null>(null)

  // Group profiles by role for the demo cards
  const byRole = mockProfiles.reduce<Record<UserRole, typeof mockProfiles>>((acc, p) => {
    if (!acc[p.role]) acc[p.role] = []
    acc[p.role].push(p)
    return acc
  }, {} as Record<UserRole, typeof mockProfiles>)

  const roleOrder: UserRole[] = ['coordenacao', 'supervisor', 'mentor', 'orientador']

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard')
    }
  }, [authLoading, user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      const profile = mockProfiles.find(p => p.email.toLowerCase() === email.toLowerCase())
      router.push(profile ? getRoleHome(profile.role) : '/dashboard')
    }
  }

  function handleCardLogin(profileId: string, role: UserRole) {
    setActiveProfile(profileId)
    loginAs(profileId)
    setTimeout(() => router.push(getRoleHome(role)), 300)
  }

  function fillEmail(email: string) {
    setEmail(email)
    setPassword(demoPassword)
  }

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] to-[#F0EDE8] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[420px] flex-col bg-primary text-white p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white" />
          <div className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-white" />
        </div>
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-8 text-3xl font-bold leading-tight">Mentoria<br />Residência Afya</h1>
          <p className="mt-3 text-white/70 text-sm leading-relaxed">
            Plataforma interna de inteligência operacional para acompanhamento de alunos em preparação para residência médica.
          </p>
        </div>
        <div className="relative mt-auto space-y-4">
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
            <p className="text-sm font-semibold">8 alunos acompanhados</p>
            <p className="text-xs text-white/60 mt-0.5">ENARE, USP-SP, UNICAMP e outros</p>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
            <p className="text-sm font-semibold">3 mentores ativos</p>
            <p className="text-xs text-white/60 mt-0.5">Reuniões semanais individuais</p>
          </div>
          <p className="text-xs text-white/40 pt-2">© 2025 Afya · Todos os direitos reservados</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-start py-10 px-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-foreground">Mentoria Residência</span>
          </div>

          <div className="w-full max-w-lg">
            <h2 className="text-2xl font-bold text-foreground">Entrar na plataforma</h2>
            <p className="text-sm text-muted-foreground mt-1">Use suas credenciais ou selecione um perfil demo abaixo</p>

            {/* Email/Password form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-border/60 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="password">Senha</label>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border/60 bg-white px-3 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Senha padrão demo: <code className="bg-muted px-1 rounded">{demoPassword}</code></p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
              <div className="relative flex justify-center"><span className="bg-[#F8F9FB] px-3 text-xs text-muted-foreground">ou entre rapidamente como</span></div>
            </div>

            {/* Profile cards by role */}
            <div className="space-y-4">
              {roleOrder.filter(r => byRole[r]).map(role => (
                <div key={role}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {roleLabel[role]}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {byRole[role].map(profile => {
                      const parts = profile.name.split(' ')
                      const initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                      const isActive = activeProfile === profile.id
                      return (
                        <button
                          key={profile.id}
                          onClick={() => {
                            fillEmail(profile.email)
                            handleCardLogin(profile.id, profile.role)
                          }}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border bg-white p-3 text-left transition-all hover:shadow-md hover:border-primary/30',
                            isActive && 'border-primary shadow-md scale-[0.98]'
                          )}
                        >
                          <div className={cn(
                            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white text-xs font-bold',
                            roleAvatarBg[role]
                          )}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{profile.name}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{profile.email}</p>
                            <span className={cn(
                              'inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full border mt-0.5',
                              roleColor[role]
                            )}>
                              {roleLabel[role]}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
