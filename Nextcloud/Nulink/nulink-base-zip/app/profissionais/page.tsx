'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import Badge from '@/components/Badge'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Star, Phone } from 'lucide-react'

export default function Profissionais() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nome:'', email:'', telefone:'', whatsapp:'', cidade:'', estado:'SP', especialidades:'', certificacoes:'', status:'ativo', notas:'' })
  const inputStyle = { width:'100%', padding:'10px 14px', background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, outline:'none' }
  const labelStyle = { fontSize:12, color:'var(--text-muted)', marginBottom:4, display:'block' }
  async function load() {
    let q = supabase.from('profissionais').select('*').order('nome')
    if (search) q = q.ilike('nome', `%${search}%`)
    const { data } = await q; setData(data||[]); setLoading(false)
  }
  useEffect(()=>{load()},[search])
  async function salvar() {
    await supabase.from('profissionais').insert([{ ...form, especialidades: form.especialidades.split(',').map((s:string)=>s.trim()).filter(Boolean), certificacoes: form.certificacoes.split(',').map((s:string)=>s.trim()).filter(Boolean) }])
    setModal(false); setForm({ nome:'', email:'', telefone:'', whatsapp:'', cidade:'', estado:'SP', especialidades:'', certificacoes:'', status:'ativo', notas:'' }); load()
  }
  return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div><h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Profissionais</h1><p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{data.length} cadastrados</p></div>
        <button onClick={()=>setModal(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:14, cursor:'pointer' }}><Plus size={16}/> Novo Profissional</button>
      </div>
      <div style={{ position:'relative', marginBottom:20 }}>
        <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
        <input placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft:36 }}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
        {loading ? <p style={{color:'var(--text-muted)'}}>Carregando...</p> : data.map((p:any)=>(
          <div key={p.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(0,102,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'var(--nulink-blue)' }}>{p.nome[0]}</div>
              <Badge value={p.status}/>
            </div>
            <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:4 }}>{p.nome}</div>
            {p.telefone&&<div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}><Phone size={11}/> {p.telefone}</div>}
            {p.cidade&&<div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>📍 {p.cidade}</div>}
            {p.especialidades&&p.especialidades.length>0&&<div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:8 }}>{p.especialidades.slice(0,3).map((s:string,i:number)=><span key={i} style={{ fontSize:10, padding:'2px 8px', background:'rgba(0,102,255,0.1)', color:'var(--nulink-blue)', borderRadius:10 }}>{s}</span>)}</div>}
            <div style={{ display:'flex', alignItems:'center', gap:4 }}><Star size={12} color="var(--warning)" fill="var(--warning)"/><span style={{ fontSize:12, color:'var(--warning)', fontWeight:600 }}>{p.trust_score}</span><span style={{ fontSize:11, color:'var(--text-muted)' }}>Trust Score</span></div>
          </div>
        ))}
      </div>
      {modal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:32, width:500, maxHeight:'90vh', overflowY:'auto' }}>
            <h2 style={{ margin:'0 0 20px', fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>Novo Profissional</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'span 2' }}><label style={labelStyle}>Nome *</label><input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} style={inputStyle}/></div>
              <div><label style={labelStyle}>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inputStyle}/></div>
              <div><label style={labelStyle}>Telefone</label><input value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})} style={inputStyle}/></div>
              <div><label style={labelStyle}>WhatsApp</label><input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} style={inputStyle}/></div>
              <div><label style={labelStyle}>Cidade</label><input value={form.cidade} onChange={e=>setForm({...form,cidade:e.target.value})} style={inputStyle}/></div>
              <div style={{ gridColumn:'span 2' }}><label style={labelStyle}>Especialidades (vírgula)</label><input value={form.especialidades} onChange={e=>setForm({...form,especialidades:e.target.value})} style={inputStyle} placeholder="Soldagem, NR10, Eletricidade"/></div>
              <div style={{ gridColumn:'span 2' }}><label style={labelStyle}>Certificações</label><input value={form.certificacoes} onChange={e=>setForm({...form,certificacoes:e.target.value})} style={inputStyle}/></div>
              <div><label style={labelStyle}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}><option value="ativo">Ativo</option><option value="inativo">Inativo</option><option value="pendente">Pendente</option></select></div>
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
