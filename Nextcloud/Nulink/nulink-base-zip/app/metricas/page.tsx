'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import StatCard from '@/components/StatCard'
import { supabase } from '@/lib/supabase'
import { DollarSign, Users, Building2, TrendingUp, Briefcase, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function Metricas() {
  const [stats, setStats] = useState<any>({})
  const [periodos, setPeriodos] = useState<any[]>([])
  const [form, setForm] = useState({ periodo:'', mrr_total:0, novos_clientes:0, churn:0, deals_fechados:0, profissionais_ativos:0, notas:'' })
  const [modal, setModal] = useState(false)
  const inputStyle = { width:'100%', padding:'10px 14px', background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, outline:'none' }
  const labelStyle = { fontSize:12, color:'var(--text-muted)', marginBottom:4, display:'block' }
  async function load() {
    const [emp, prof, deals, prd] = await Promise.all([
      supabase.from('empresas').select('id,mrr,status'),
      supabase.from('profissionais').select('id,status'),
      supabase.from('deals').select('id,etapa,valor'),
      supabase.from('metricas_periodo').select('*').order('periodo',{ascending:true}).limit(12)
    ])
    const empresas = emp.data||[]; const ativos = empresas.filter((e:any)=>e.status==='ativo')
    setStats({
      mrr: ativos.reduce((s:number,e:any)=>s+(e.mrr||0),0),
      empresas: empresas.length, ativas: ativos.length,
      profissionais: (prof.data||[]).filter((p:any)=>p.status==='ativo').length,
      deals_abertos: (deals.data||[]).filter((d:any)=>!['fechado_ganho','fechado_perdido'].includes(d.etapa)).length,
      pipeline_valor: (deals.data||[]).filter((d:any)=>!['fechado_ganho','fechado_perdido'].includes(d.etapa)).reduce((s:number,d:any)=>s+(d.valor||0),0)
    })
    setPeriodos(prd.data||[])
  }
  useEffect(()=>{load()},[])
  async function salvarPeriodo() {
    await supabase.from('metricas_periodo').insert([{ ...form, mrr_total:+form.mrr_total, novos_clientes:+form.novos_clientes, churn:+form.churn, deals_fechados:+form.deals_fechados, profissionais_ativos:+form.profissionais_ativos }])
    setModal(false); setForm({ periodo:'', mrr_total:0, novos_clientes:0, churn:0, deals_fechados:0, profissionais_ativos:0, notas:'' }); load()
  }
  return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div><h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Métricas</h1><p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>Visão financeira e operacional</p></div>
        <button onClick={()=>setModal(true)} style={{ padding:'10px 18px', background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:14, cursor:'pointer' }}>+ Adicionar Período</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16, marginBottom:32 }}>
        <StatCard label="MRR Atual" value={`R$ ${(stats.mrr||0).toLocaleString('pt-BR')}`} icon={DollarSign} color="var(--success)"/>
        <StatCard label="Empresas Ativas" value={stats.ativas||0} icon={Building2} color="var(--nulink-blue)"/>
        <StatCard label="Profissionais Ativos" value={stats.profissionais||0} icon={Users} color="#8B5CF6"/>
        <StatCard label="Deals no Funil" value={stats.deals_abertos||0} icon={Briefcase} color="var(--warning)"/>
        <StatCard label="Valor no Pipeline" value={`R$ ${(stats.pipeline_valor||0).toLocaleString('pt-BR',{maximumFractionDigits:0})}`} icon={TrendingUp} color="var(--nulink-blue-light)"/>
        <StatCard label="Total Empresas" value={stats.empresas||0} icon={Activity} color="var(--text-muted)"/>
      </div>
      {periodos.length>0&&(
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:28 }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
            <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:600, color:'var(--text-primary)' }}>Evolução MRR</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={periodos}>
                <XAxis dataKey="periodo" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:'var(--bg-card-hover)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)' }}/>
                <Area type="monotone" dataKey="mrr_total" stroke="var(--nulink-blue)" fill="rgba(0,102,255,0.1)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
            <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:600, color:'var(--text-primary)' }}>Novos Clientes vs Churn</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={periodos}>
                <XAxis dataKey="periodo" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:'var(--bg-card-hover)', border:'1px solid var(--border)', borderRadius:8 }}/>
                <Line type="monotone" dataKey="novos_clientes" stroke="var(--success)" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="churn" stroke="var(--danger)" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {modal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:32, width:480 }}>
            <h2 style={{ margin:'0 0 20px', fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>Adicionar Período</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'span 2' }}><label style={labelStyle}>Período (ex: 2025-01)</label><input value={form.periodo} onChange={e=>setForm({...form,periodo:e.target.value})} style={inputStyle} placeholder="2025-06"/></div>
              {[['mrr_total','MRR Total (R$)'],['novos_clientes','Novos Clientes'],['churn','Churn'],['deals_fechados','Deals Fechados'],['profissionais_ativos','Profissionais Ativos']].map(([k,l])=>(
                <div key={k}><label style={labelStyle}>{l}</label><input type="number" value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={inputStyle}/></div>
              ))}
            </div>
            <div style={{ display:'flex', gap:12, marginTop:20 }}>
              <button onClick={salvarPeriodo} style={{ flex:1, padding:11, background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer' }}>Salvar</button>
              <button onClick={()=>setModal(false)} style={{ padding:'11px 20px', background:'var(--bg-primary)', color:'var(--text-secondary)', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
