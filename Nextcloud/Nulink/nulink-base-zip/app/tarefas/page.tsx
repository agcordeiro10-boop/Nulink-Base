'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import Badge from '@/components/Badge'
import { supabase } from '@/lib/supabase'
import { Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

export default function Tarefas() {
  const [data, setData] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ titulo:'', descricao:'', prioridade:'media', status:'pendente', data_vencimento:'' })
  const inputStyle = { width:'100%', padding:'10px 14px', background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, outline:'none' }
  const labelStyle = { fontSize:12, color:'var(--text-muted)', marginBottom:4, display:'block' }
  async function load() { const { data } = await supabase.from('tarefas').select('*').order('data_vencimento',{ascending:true}); setData(data||[]) }
  useEffect(()=>{load()},[])
  async function salvar() {
    const dadosTarefa = Object.fromEntries(Object.entries(form).map(([k,v]) => [k, v === '' ? null : v]))
    await supabase.from('tarefas').insert([dadosTarefa]); setModal(false)
    setForm({ titulo:'', descricao:'', prioridade:'media', status:'pendente', data_vencimento:'' }); load()
  }
  async function toggleStatus(t: any) {
    const novo = t.status === 'concluida' ? 'pendente' : 'concluida'
    await supabase.from('tarefas').update({ status: novo, updated_at: new Date().toISOString() }).eq('id', t.id); load()
  }
  const pendentes = data.filter(t=>t.status==='pendente'||t.status==='em_progresso')
  const concluidas = data.filter(t=>t.status==='concluida')
  return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div><h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Tarefas</h1><p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{pendentes.length} pendentes · {concluidas.length} concluídas</p></div>
        <button onClick={()=>setModal(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:14, cursor:'pointer' }}><Plus size={16}/> Nova Tarefa</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {data.map((t:any)=>(
          <div key={t.id} onClick={()=>toggleStatus(t)} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', opacity: t.status==='concluida'?0.6:1, transition:'all 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--nulink-blue)')}
            onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border)')}>
            {t.status==='concluida' ? <CheckCircle2 size={20} color="var(--success)"/> : <div style={{ width:20, height:20, borderRadius:'50%', border:'2px solid var(--border)' }}/>}
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color: t.status==='concluida'?'var(--text-muted)':'var(--text-primary)', textDecoration: t.status==='concluida'?'line-through':'none' }}>{t.titulo}</div>
              {t.data_vencimento&&<div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2, display:'flex', alignItems:'center', gap:4 }}><Clock size={10}/>{new Date(t.data_vencimento).toLocaleDateString('pt-BR')}</div>}
            </div>
            <Badge value={t.prioridade}/>
            <Badge value={t.status}/>
          </div>
        ))}
        {data.length===0&&<p style={{color:'var(--text-muted)',textAlign:'center',padding:40}}>Nenhuma tarefa. Crie a primeira!</p>}
      </div>
      {modal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:32, width:460 }}>
            <h2 style={{ margin:'0 0 20px', fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>Nova Tarefa</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div><label style={labelStyle}>Título *</label><input value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} style={inputStyle}/></div>
              <div><label style={labelStyle}>Descrição</label><textarea value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={labelStyle}>Prioridade</label><select value={form.prioridade} onChange={e=>setForm({...form,prioridade:e.target.value})} style={inputStyle}><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select></div>
                <div><label style={labelStyle}>Vencimento</label><input type="date" value={form.data_vencimento} onChange={e=>setForm({...form,data_vencimento:e.target.value})} style={inputStyle}/></div>
              </div>
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
