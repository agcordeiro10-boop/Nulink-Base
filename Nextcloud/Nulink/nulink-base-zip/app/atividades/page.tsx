'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { Plus } from 'lucide-react'

const TIPOS = ['ligacao','email','reuniao','whatsapp','visita','tarefa','nota']
const ICONS: Record<string,string> = { ligacao:'📞', email:'📧', reuniao:'🤝', whatsapp:'💬', visita:'🏢', tarefa:'✅', nota:'📝' }

export default function Atividades() {
  const [data, setData] = useState<any[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ tipo:'nota', titulo:'', descricao:'', empresa_id:'', data_atividade: new Date().toISOString().slice(0,16) })
  const inputStyle = { width:'100%', padding:'10px 14px', background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, outline:'none' }
  const labelStyle = { fontSize:12, color:'var(--text-muted)', marginBottom:4, display:'block' }
  async function load() {
    const { data } = await supabase.from('atividades').select('*, empresa:empresas(nome)').order('data_atividade',{ascending:false}).limit(50)
    setData(data||[])
    const { data: emp } = await supabase.from('empresas').select('id,nome')
    setEmpresas(emp||[])
  }
  useEffect(()=>{load()},[])
  async function salvar() {
    await supabase.from('atividades').insert([form]); setModal(false)
    setForm({ tipo:'nota', titulo:'', descricao:'', empresa_id:'', data_atividade: new Date().toISOString().slice(0,16) }); load()
  }
  return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div><h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Histórico de Interações</h1><p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{data.length} atividades registradas</p></div>
        <button onClick={()=>setModal(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:14, cursor:'pointer' }}><Plus size={16}/> Registrar Atividade</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
        {data.map((a:any, i:number)=>(
          <div key={a.id} style={{ display:'flex', gap:16, position:'relative' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:32 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--bg-card)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, zIndex:1 }}>{ICONS[a.tipo]||'📋'}</div>
              {i<data.length-1&&<div style={{ width:1, flex:1, background:'var(--border)', minHeight:20 }}/>}
            </div>
            <div style={{ flex:1, paddingBottom:20 }}>
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>{a.titulo}</span>
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>{new Date(a.data_atividade).toLocaleDateString('pt-BR', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                </div>
                {a.empresa&&<div style={{ fontSize:12, color:'var(--nulink-blue)', marginBottom:4 }}>🏢 {a.empresa.nome}</div>}
                {a.descricao&&<div style={{ fontSize:13, color:'var(--text-secondary)' }}>{a.descricao}</div>}
              </div>
            </div>
          </div>
        ))}
        {data.length===0&&<p style={{color:'var(--text-muted)',textAlign:'center',padding:40}}>Nenhuma atividade registrada ainda.</p>}
      </div>
      {modal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:32, width:480 }}>
            <h2 style={{ margin:'0 0 20px', fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>Registrar Atividade</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={labelStyle}>Tipo</label><select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} style={inputStyle}>{TIPOS.map(t=><option key={t} value={t}>{ICONS[t]} {t}</option>)}</select></div>
                <div><label style={labelStyle}>Empresa</label><select value={form.empresa_id} onChange={e=>setForm({...form,empresa_id:e.target.value})} style={inputStyle}><option value="">Selecione...</option>{empresas.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
              </div>
              <div><label style={labelStyle}>Título *</label><input value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} style={inputStyle}/></div>
              <div><label style={labelStyle}>Descrição</label><textarea value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} rows={3} style={{...inputStyle,resize:'vertical'}}/></div>
              <div><label style={labelStyle}>Data/Hora</label><input type="datetime-local" value={form.data_atividade} onChange={e=>setForm({...form,data_atividade:e.target.value})} style={inputStyle}/></div>
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
