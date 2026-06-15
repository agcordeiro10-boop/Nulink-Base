'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import StatCard from '@/components/StatCard'
import { supabase } from '@/lib/supabase'
import { Building2, Users, Briefcase, DollarSign, TrendingUp, CheckSquare, AlertCircle, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PIPELINE_COLORS = ['#556080','#8B5CF6','#0066FF','#FFB020','#00C896','#FF4560']

export default function Dashboard() {
  const [stats, setStats] = useState({ empresas: 0, profissionais: 0, deals: 0, mrr: 0, tarefas: 0, atividades: 0 })
  const [pipeline, setPipeline] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [emp, prof, deals, tarefas, atv] = await Promise.all([
        supabase.from('empresas').select('id, mrr, status'),
        supabase.from('profissionais').select('id, status'),
        supabase.from('deals').select('id, etapa, valor'),
        supabase.from('tarefas').select('id, status'),
        supabase.from('atividades').select('id, tipo, titulo, data_atividade').order('data_atividade', { ascending: false }).limit(8)
      ])
      const empresas = emp.data || []
      const profissionais = prof.data || []
      const dealsData = deals.data || []
      const tarefasData = tarefas.data || []
      const mrr = empresas.reduce((s: number, e: any) => s + (e.mrr || 0), 0)
      setStats({
        empresas: empresas.length,
        profissionais: profissionais.filter((p: any) => p.status === 'ativo').length,
        deals: dealsData.filter((d: any) => !['fechado_ganho','fechado_perdido'].includes(d.etapa)).length,
        mrr,
        tarefas: tarefasData.filter((t: any) => t.status === 'pendente').length,
        atividades: (atv.data || []).length
      })
      const etapas = ['prospeccao','qualificacao','proposta','negociacao','fechado_ganho','fechado_perdido']
      const labels: Record<string,string> = { prospeccao:'Prospecção', qualificacao:'Qualificação', proposta:'Proposta', negociacao:'Negociação', fechado_ganho:'Ganho', fechado_perdido:'Perdido' }
      setPipeline(etapas.map((e, i) => ({
        name: labels[e], count: dealsData.filter((d: any) => d.etapa === e).length,
        valor: dealsData.filter((d: any) => d.etapa === e).reduce((s: number, d: any) => s + (d.valor || 0), 0),
        color: PIPELINE_COLORS[i]
      })))
      setRecentActivities(atv.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const tipoIcon: Record<string, string> = { ligacao: '📞', email: '📧', reuniao: '🤝', whatsapp: '💬', visita: '🏢', tarefa: '✅', nota: '📝' }

  return (
    <Layout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>Visão geral do Nulink Base</p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 60 }}>Carregando...</div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Empresas" value={stats.empresas} icon={Building2} color="var(--nulink-blue)" />
            <StatCard label="Profissionais Ativos" value={stats.profissionais} icon={Users} color="var(--success)" />
            <StatCard label="Deals Abertos" value={stats.deals} icon={Briefcase} color="#8B5CF6" />
            <StatCard label="MRR Total" value={`R$ ${stats.mrr.toLocaleString('pt-BR', {minimumFractionDigits:0})}`} icon={DollarSign} color="var(--warning)" />
            <StatCard label="Tarefas Pendentes" value={stats.tarefas} icon={AlertCircle} color="var(--danger)" />
            <StatCard label="Atividades" value={stats.atividades} icon={Activity} color="var(--nulink-blue-light)" />
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Pipeline por Etapa</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pipeline}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" radius={[4,4,0,0]} fill="var(--nulink-blue)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Distribuição Pipeline</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pipeline.filter(p => p.count > 0)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={60} paddingAngle={3}>
                    {pipeline.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {pipeline.filter(p => p.count > 0).map((p, i) => (
                  <span key={i} style={{ fontSize: 10, color: p.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Atividades Recentes</h3>
            {recentActivities.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma atividade registrada ainda.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentActivities.map((a: any) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 18 }}>{tipoIcon[a.tipo] || '📋'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{a.titulo}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(a.data_atividade).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}
