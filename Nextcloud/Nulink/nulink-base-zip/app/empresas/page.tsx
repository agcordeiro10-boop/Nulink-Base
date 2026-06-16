'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import Badge from '@/components/Badge'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Building2, Phone, Pencil, Trash2 } from 'lucide-react'

const STATUS = ['lead','prospecto','ativo','inativo','churned']
const PORTES = ['MEI','ME','EPP','Medio','Grande']

const emptyForm = { nome:'', cnpj:'', segmento:'', porte:'', cidade:'', estado:'SP', telefone:'', email_contato:'', status:'lead', mrr:'0', origem:'', notas:'' }

function clean(obj: any) {
  return Object.fromEntries(Object.entries(obj).map(([k,v]) => [k, v === '' ? null : v]))
}

export default function Empresas() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyForm)
  const [saving, setSaving] = useState(false)

  const inp = { width:'100%', padding:'10px 14px', background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, outline:'none' }
  const lbl = { fontSize:12, color:'var(--text-muted)', marginBottom:4, display:'block' }

  async function load() {
    setLoading(true)
    let q = supabase.from('empresas').select('*').order('created_at', { ascending: false })
    if (filterStatus) q = q.eq('status', filterStatus)
    if (search) q = q.ilike('nome', `%${search}%`)
    const { data, error } = await q
    if (error) console.error(error)
    setEmpresas(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [search, filterStatus])

  async function salvar() {
    if (!form.nome) return alert('Nome obrigatório')
    setSaving(true)
    const dados = clean({ ...form, mrr: parseFloat(form.mrr) || 0 })
    if (editing) {
      const { error } = await supabase.from('empresas').update(dados).eq('id', editing.id)
      if (error) { alert('Erro: ' + error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('empresas').insert(dados)
      if (error) { alert('Erro: ' + error.message); setSaving(false); return }
    }
    setSaving(false)
    setModal(false)
    setEditing(null)
    setForm(emptyForm)
    load()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir empresa?')) return
    await supabase.from('empresas').delete().eq('id', id)
    load()
  }

  function editar(e: any) {
    setEditing(e)
    setForm({ nome:e.nome||'', cnpj:e.cnpj||'', segmento:e.segmento||'', porte:e.porte||'', cidade:e.cidade||'', estado:e.estado||'SP', telefone:e.telefone||'', email_contato:e.email_contato||'', status:e.status||'lead', mrr:String(e.mrr||0), origem:e.origem||'', notas:e.notas||'' })
    setModal(true)
  }

  return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Empresas</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{empresas.length} empresas</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setModal(true) }} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:14, cursor:'pointer' }}>
          <Plus size={16}/> Nova Empresa
        </button>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        <div style={{ position:'relative', flex:1 }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input placeholder="Buscar empresa..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, paddingLeft:36 }}/>
        </div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ ...inp, width:'auto', minWidth:140 }}>
          <option value="">Todos os status</option>
          {STATUS.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border)' }}>
              {['Empresa','Segmento','Cidade','Status','MRR','Ações'].map(h=>(
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Carregando...</td></tr>
            ) : empresas.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Nenhuma empresa encontrada</td></tr>
            ) : empresas.map(e=>(
              <tr key={e.id} style={{ borderBottom:'1px solid var(--border)' }}
                onMouseEnter={ev=>(ev.currentTarget.style.background='var(--bg-card-hover)')}
                onMouseLeave={ev=>(ev.currentTarget.style.background='transparent')}>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'rgba(0,102,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Building2 size={15} color="var(--nulink-blue)"/>
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>{e.nome}</div>
                      {e.telefone&&<div style={{ fontSize:11, color:'var(--text-muted)' }}><Phone size={10}/> {e.telefone}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-secondary)' }}>{e.segmento||'-'}</td>
                <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-secondary)' }}>{e.cidade?`${e.cidade}, ${e.estado}`:'-'}</td>
                <td style={{ padding:'12px 16px' }}><Badge value={e.status}/></td>
                <td style={{ padding:'12px 16px', fontSize:13, color:'var(--success)', fontWeight:600 }}>{e.mrr>0?`R$ ${Number(e.mrr).toLocaleString('pt-BR')}`:'-'}</td>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>editar(e)} style={{ padding:'6px 8px', background:'rgba(0,102,255,0.1)', border:'none', borderRadius:6, cursor:'pointer', color:'var(--nulink-blue)' }}><Pencil size={13}/></button>
                    <button onClick={()=>excluir(e.id)} style={{ padding:'6px 8px', background:'rgba(255,69,96,0.1)', border:'none', borderRadius:6, cursor:'pointer', color:'var(--danger)' }}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:32, width:560, maxHeight:'90vh', overflowY:'auto' }}>
            <h2 style={{ margin:'0 0 24px', fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>{editing?'Editar Empresa':'Nova Empresa'}</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'span 2' }}><label style={lbl}>Nome *</label><input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} style={inp}/></div>
              <div><label style={lbl}>CNPJ</label><input value={form.cnpj} onChange={e=>setForm({...form,cnpj:e.target.value})} style={inp}/></div>
              <div><label style={lbl}>Segmento</label><input value={form.segmento} onChange={e=>setForm({...form,segmento:e.target.value})} style={inp}/></div>
              <div><label style={lbl}>Cidade</label><input value={form.cidade} onChange={e=>setForm({...form,cidade:e.target.value})} style={inp}/></div>
              <div><label style={lbl}>Estado</label><input value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} style={inp}/></div>
              <div><label style={lbl}>Telefone</label><input value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})} style={inp}/></div>
              <div><label style={lbl}>Email</label><input value={form.email_contato} onChange={e=>setForm({...form,email_contato:e.target.value})} style={inp}/></div>
              <div><label style={lbl}>MRR (R$)</label><input type="number" value={form.mrr} onChange={e=>setForm({...form,mrr:e.target.value})} style={inp}/></div>
              <div><label style={lbl}>Origem</label><input value={form.origem} onChange={e=>setForm({...form,origem:e.target.value})} style={inp}/></div>
              <div><label style={lbl}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inp}>
                  {STATUS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Porte</label>
                <select value={form.porte} onChange={e=>setForm({...form,porte:e.target.value})} style={inp}>
                  <option value="">Selecione</option>
                  {PORTES.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'span 2' }}><label style={lbl}>Notas</label><textarea value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})} rows={3} style={{ ...inp, resize:'vertical' }}/></div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button onClick={salvar} disabled={saving} style={{ flex:1, padding:11, background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer', opacity:saving?0.7:1 }}>{saving?'Salvando...':'Salvar'}</button>
              <button onClick={()=>{setModal(false);setEditing(null)}} style={{ padding:'11px 20px', background:'var(--bg-primary)', color:'var(--text-secondary)', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
