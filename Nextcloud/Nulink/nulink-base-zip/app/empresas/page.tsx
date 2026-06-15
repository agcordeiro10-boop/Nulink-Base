'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import Badge from '@/components/Badge'
import { supabase, type Empresa } from '@/lib/supabase'
import { Plus, Search, Building2, Phone, Mail, DollarSign, Pencil, Trash2 } from 'lucide-react'

const STATUS = ['lead','prospecto','ativo','inativo','churned']
const PORTES = ['MEI','ME','EPP','Medio','Grande']

export default function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [form, setForm] = useState({ nome:'', cnpj:'', segmento:'', porte:'', cidade:'', estado:'SP', telefone:'', email_contato:'', status:'lead', mrr:0, origem:'', notas:'' })

  async function load() {
    let q = supabase.from('empresas').select('*').order('created_at', { ascending: false })
    if (filterStatus) q = q.eq('status', filterStatus)
    if (search) q = q.ilike('nome', `%${search}%`)
    const { data } = await q
    setEmpresas(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [search, filterStatus])

  async function salvar() {
    const dados = Object.fromEntries(Object.entries(form).map(([k,v]) => [k, v === '' ? null : v]))
    if (editing) {
      await supabase.from('empresas').update({ ...dados, updated_at: new Date().toISOString() }).eq('id', editing.id)
    } else {
      await supabase.from('empresas').insert([dados])
    }
    setModal(false); setEditing(null); setForm({ nome:'', cnpj:'', segmento:'', porte:'', cidade:'', estado:'SP', telefone:'', email_contato:'', status:'lead', mrr:0, origem:'', notas:'' })
    load()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir empresa?')) return
    await supabase.from('empresas').delete().eq('id', id)
    load()
  }

  function abrirEdicao(e: Empresa) {
    setEditing(e)
    setForm({ nome: e.nome, cnpj: e.cnpj||'', segmento: e.segmento||'', porte: e.porte||'', cidade: e.cidade||'', estado: e.estado||'SP', telefone: e.telefone||'', email_contato: e.email_contato||'', status: e.status, mrr: e.mrr, origem: e.origem||'', notas: e.notas||'' })
    setModal(true)
  }

  const inputStyle = { width:'100%', padding:'10px 14px', background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, outline:'none' }
  const labelStyle = { fontSize:12, color:'var(--text-muted)', marginBottom:4, display:'block' }

  return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Empresas</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{empresas.length} empresas encontradas</p>
        </div>
        <button onClick={() => { setEditing(null); setModal(true) }} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:14, cursor:'pointer' }}>
          <Plus size={16} /> Nova Empresa
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:220 }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input placeholder="Buscar empresa..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft:36 }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width:'auto', minWidth:140 }}>
          <option value="">Todos os status</option>
          {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Tabela */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border)' }}>
              {['Empresa','Segmento','Cidade','Status','MRR','Ações'].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Carregando...</td></tr>
            ) : empresas.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Nenhuma empresa encontrada</td></tr>
            ) : empresas.map(e => (
              <tr key={e.id} style={{ borderBottom:'1px solid var(--border)' }}
                onMouseEnter={ev => (ev.currentTarget.style.background='var(--bg-card-hover)')}
                onMouseLeave={ev => (ev.currentTarget.style.background='transparent')}>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'rgba(0,102,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Building2 size={15} color="var(--nulink-blue)" />
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>{e.nome}</div>
                      {e.telefone && <div style={{ fontSize:11, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:3 }}><Phone size={10}/> {e.telefone}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-secondary)' }}>{e.segmento || '-'}</td>
                <td style={{ padding:'12px 16px', fontSize:13, color:'var(--text-secondary)' }}>{e.cidade ? `${e.cidade}, ${e.estado}` : '-'}</td>
                <td style={{ padding:'12px 16px' }}><Badge value={e.status} /></td>
                <td style={{ padding:'12px 16px', fontSize:13, color:'var(--success)', fontWeight:600 }}>
                  {e.mrr > 0 ? `R$ ${e.mrr.toLocaleString('pt-BR')}` : '-'}
                </td>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => abrirEdicao(e)} style={{ padding:'6px 8px', background:'rgba(0,102,255,0.1)', border:'none', borderRadius:6, cursor:'pointer', color:'var(--nulink-blue)' }}><Pencil size={13}/></button>
                    <button onClick={() => excluir(e.id)} style={{ padding:'6px 8px', background:'rgba(255,69,96,0.1)', border:'none', borderRadius:6, cursor:'pointer', color:'var(--danger)' }}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:32, width:560, maxHeight:'90vh', overflowY:'auto' }}>
            <h2 style={{ margin:'0 0 24px', fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>{editing ? 'Editar Empresa' : 'Nova Empresa'}</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[['nome','Nome *','text'],['cnpj','CNPJ','text'],['segmento','Segmento','text'],['cidade','Cidade','text'],['estado','Estado','text'],['telefone','Telefone','text'],['email_contato','Email','email'],['origem','Origem','text'],['mrr','MRR (R$)','number']].map(([k, l, t]) => (
                <div key={k} style={k === 'nome' ? { gridColumn:'span 2' } : {}}>
                  <label style={labelStyle}>{l}</label>
                  <input type={t} value={(form as any)[k]} onChange={e => setForm({...form, [k]: t === 'number' ? +e.target.value : e.target.value})} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inputStyle}>
                  {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Porte</label>
                <select value={form.porte} onChange={e => setForm({...form, porte: e.target.value})} style={inputStyle}>
                  <option value="">Selecione</option>
                  {PORTES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'span 2' }}>
                <label style={labelStyle}>Notas</label>
                <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} rows={3} style={{ ...inputStyle, resize:'vertical' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button onClick={salvar} style={{ flex:1, padding:'11px', background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:14, cursor:'pointer' }}>Salvar</button>
              <button onClick={() => { setModal(false); setEditing(null) }} style={{ padding:'11px 20px', background:'var(--bg-primary)', color:'var(--text-secondary)', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
