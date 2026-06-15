'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Download, FileText } from 'lucide-react'

export default function Relatorios() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    async function load() {
      const [e,d] = await Promise.all([
        supabase.from('empresas').select('*').order('created_at',{ascending:false}),
        supabase.from('deals').select('*, empresa:empresas(nome)').order('created_at',{ascending:false})
      ])
      setEmpresas(e.data||[]); setDeals(d.data||[]); setLoading(false)
    }
    load()
  },[])

  function exportCSV(dados: any[], nome: string) {
    if(!dados.length) return
    const cols = Object.keys(dados[0])
    const csv = [cols.join(','), ...dados.map(r=>cols.map(c=>`"${(r[c]??'').toString().replace(/"/g,'""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`${nome}-${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const cardStyle = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24 }
  return (
    <Layout>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Relatórios</h1>
        <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>Exporte e analise seus dados</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:20, marginBottom:28 }}>
        {[
          { titulo:'Relatório de Empresas', desc:`${empresas.length} empresas cadastradas`, acao:()=>exportCSV(empresas,'empresas'), cor:'var(--nulink-blue)' },
          { titulo:'Relatório de Pipeline', desc:`${deals.length} deals registrados`, acao:()=>exportCSV(deals,'pipeline'), cor:'#8B5CF6' },
          { titulo:'Empresas Ativas', desc:`${empresas.filter(e=>e.status==='ativo').length} clientes ativos`, acao:()=>exportCSV(empresas.filter(e=>e.status==='ativo'),'empresas-ativas'), cor:'var(--success)' },
          { titulo:'Deals Ganhos', desc:`${deals.filter(d=>d.etapa==='fechado_ganho').length} fechamentos ganhos`, acao:()=>exportCSV(deals.filter(d=>d.etapa==='fechado_ganho'),'deals-ganhos'), cor:'var(--warning)' },
        ].map((r,i)=>(
          <div key={i} style={cardStyle}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${r.cor}20`, display:'flex', alignItems:'center', justifyContent:'center' }}><FileText size={20} color={r.cor}/></div>
              <button onClick={r.acao} disabled={loading} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:`${r.cor}20`, color:r.cor, border:`1px solid ${r.cor}40`, borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:12 }}>
                <Download size={13}/> Exportar CSV
              </button>
            </div>
            <h3 style={{ margin:'0 0 6px', fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>{r.titulo}</h3>
            <p style={{ margin:0, fontSize:13, color:'var(--text-muted)' }}>{loading?'Carregando...':r.desc}</p>
          </div>
        ))}
      </div>
      <div style={cardStyle}>
        <h3 style={{ margin:'0 0 16px', fontSize:16, fontWeight:600, color:'var(--text-primary)' }}>Resumo Geral</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:16 }}>
          {[
            { label:'Total Empresas', value: empresas.length },
            { label:'Empresas Ativas', value: empresas.filter(e=>e.status==='ativo').length },
            { label:'Leads', value: empresas.filter(e=>e.status==='lead').length },
            { label:'MRR Total', value:`R$ ${empresas.reduce((s,e)=>s+(e.mrr||0),0).toLocaleString('pt-BR',{maximumFractionDigits:0})}` },
            { label:'Deals Totais', value: deals.length },
            { label:'Deals Ganhos', value: deals.filter(d=>d.etapa==='fechado_ganho').length },
          ].map((s,i)=>(
            <div key={i} style={{ padding:'12px 16px', background:'var(--bg-primary)', borderRadius:8, border:'1px solid var(--border)' }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)' }}>{loading?'...':s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
