'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Plus, Zap, Power } from 'lucide-react'

const GATILHOS = ['novo_lead','lead_qualificado','proposta_enviada','deal_ganho','deal_perdido','inatividade_7d','inatividade_30d']
const ACOES = ['enviar_whatsapp','criar_tarefa','enviar_email','mover_pipeline','notificar_equipe']

export default function Automacoes() {
  const [data, setData] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nome:'', gatilho:'novo_lead', acao:'criar_tarefa', ativa:true })
  const inputStyle = { width:'100%', padding:'10px 14px', background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, outline:'none' }
  const labelStyle = { fontSize:12, color:'var(--text-muted)', marginBottom:4, display:'block' }
  async function load() { const { data } = await supabase.from('automacoes').select('*').order('created_at',{ascending:false}); setData(data||[]) }
  useEffect(()=>{load()},[])
  async function salvar() { await supabase.from('automacoes').insert([form]); setModal(false); setForm({ nome:'', gatilho:'novo_lead', acao:'criar_tarefa', ativa:true }); load() }
  async function toggleAtiva(a: any) { await supabase.from('automacoes').update({ ativa: !a.ativa }).eq('id', a.id); load() }
  return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div><h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Automações</h1><p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{data.filter(a=>a.ativa).length} ativas · {data.length} total</p></div>
        <button onClick={()=>setModal(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:14, cursor:'pointer' }}><Plus size={16}/> Nova Automação</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {data.map((a:any)=>(
          <div key={a.id} style={{ background:'var(--bg-card)', border:`1px solid ${a.ativa?'var(--nulink-blue)':'var(--border)'}`, borderRadius:12, padding:'16px 20px', display:'flex', alignItems:'center', gap:16, opacity:a.ativa?1:0.6 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:a.ativa?'rgba(0,102,255,0.15)':'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={20} color={a.ativa?'var(--nulink-blue)':'var(--text-muted)'}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:15, color:'var(--text-primary)', marginBottom:4 }}>{a.nome}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                Gatilho: <span style={{ color:'var(--nulink-blue)' }}>{a.gatilho}</span> → Ação: <span style={{ color:'var(--success)' }}>{a.acao}</span>
              </div>
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', textAlign:'right' }}>
              {a.total_execucoes} execuções<br/>
              {a.ultima_execucao?new Date(a.ultima_execucao).toLocaleDateString('pt-BR'):'Nunca executada'}
            </div>
            <button onClick={()=>toggleAtiva(a)} style={{ padding:'8px 12px', background:a.ativa?'rgba(0,200,150,0.15)':'rgba(255,255,255,0.05)', color:a.ativa?'var(--success)':'var(--text-muted)', border:'none', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontWeight:600, fontSize:12 }}>
              <Power size={14}/>{a.ativa?'Ativa':'Inativa'}
            </button>
          </div>
        ))}
        {data.length===0&&<div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}><Zap size={40} style={{ opacity:0.2, marginBottom:12 }}/><br/>Nenhuma automação configurada ainda.</div>}
      </div>
      {modal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:32, width:460 }}>
            <h2 style={{ margin:'0 0 20px', fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>Nova Automação</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div><label style={labelStyle}>Nome *</label><input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} style={inputStyle} placeholder="ex: Follow-up após proposta"/></div>
              <div><label style={labelStyle}>Gatilho (quando?)</label><select value={form.gatilho} onChange={e=>setForm({...form,gatilho:e.target.value})} style={inputStyle}>{GATILHOS.map(g=><option key={g} value={g}>{g.replace(/_/g,' ')}</option>)}</select></div>
              <div><label style={labelStyle}>Ação (o que fazer?)</label><select value={form.acao} onChange={e=>setForm({...form,acao:e.target.value})} style={inputStyle}>{ACOES.map(a=><option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}</select></div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:20 }}>
              <button onClick={salvar} style={{ flex:1, padding:11, background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer' }}>Salvar</button>
              <button onClick={()=>setModal(false)} style={{ padding:'11px 20px', background:'var(--bg-primary)', color:'var(--text-secondary)', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
