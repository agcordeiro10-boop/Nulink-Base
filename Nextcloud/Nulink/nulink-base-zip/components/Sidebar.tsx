'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, Briefcase, CheckSquare,
  BarChart3, FileText, Zap, MessageSquare, ChevronRight
} from 'lucide-react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/empresas', label: 'Empresas', icon: Building2 },
  { href: '/profissionais', label: 'Profissionais', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: Briefcase },
  { href: '/tarefas', label: 'Tarefas', icon: CheckSquare },
  { href: '/atividades', label: 'Histórico', icon: MessageSquare },
  { href: '/metricas', label: 'Métricas', icon: BarChart3 },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/automacoes', label: 'Automações', icon: Zap },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: 'var(--nulink-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff'
          }}>N</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Nulink Base</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CRM Operacional</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px' }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 8, marginBottom: 2, textDecoration: 'none',
              background: active ? 'rgba(0,102,255,0.15)' : 'transparent',
              color: active ? 'var(--nulink-blue-light)' : 'var(--text-secondary)',
              fontWeight: active ? 600 : 400, fontSize: 14,
              transition: 'all 0.15s',
              borderLeft: active ? '2px solid var(--nulink-blue)' : '2px solid transparent'
            }}>
              <Icon size={17} />
              {label}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          Nulink Base v1.0 · {new Date().getFullYear()}
        </div>
      </div>
    </aside>
  )
}
