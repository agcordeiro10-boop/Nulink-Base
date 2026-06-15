'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase, type Deal } from '@/lib/supabase'
import { Plus, DollarSign } from 'lucide-react'

const ETAPAS = [
  { id:'prospeccao', label:'Prospecção', color:'#556080' },
  { id:'qualificacao', label:'Qualificação', color:'#8B5CF6' },
  { id:'proposta', label:'Proposta', color:'#0066FF' },
  { id:'negociacao', label:'Negociação', color:'#FFB020' },
  { id:'fechado_ganho', label:'Fechado ✓', color:'#00C896' },
  { id:'fechado_perdido', label:'Perdido ✗', color:'#FF4560' },
]

export default function Pipeline() {
  const [deals, setDeals] = useState<(Deal & { empresa?: any })[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ titulo:'', empresa_id:'', etapa:'prospeccao', valor:0, probabilidade:50, notas:'' })

  async function load() {
    const { data } = await supabase.from('deals').select('*, empresa:empresas(nome)').order('created_at', { ascending: false })
    setDeals(data || [])
    const { data: emp } = await supabase.from('empresas').select('id, nome')
    setEmpresas(emp || [])
  }
  useEffect(() => { load() }, [])

  async function salvar() {
    const dadosDeal = Object.fromEntries(Object.entries({ ...form, valor: +form.valor, probabilidade: +form.probabilidade }).map(([k,v]) => [k, v === '' ? null : v]))
    await supabase.from('deals').insert([dadosDeal])
    setModal(false); setForm({ titulo:'', empresa_id:'', etapa:'prospeccao', valor:0, probabilidade:50, notas:'' }); load()
  }

  async function moverEtapa(deal: Deal, novaEtapa: string) {
    await supabase.from('deals').update({ etapa: novaEtapa, updated_at: new Date().toISOString() }).eq('id', deal.id)
    load()
  }

  const inputStyle = { width:'100%', padding:'10px 14px', background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', fontSize:14, outline:'none' }
  const labelStyle = { fontSize:12, color:'var(--text-muted)', marginBottom:4, display:'block' }

  return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Pipeline</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{deals.length} deals no funil</p>
        </div>
        <button onClick={() => setModal(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:14, cursor:'pointer' }}>
          <Plus size={16} /> Novo Deal
        </button>
      </div>

      {/* Kanban */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:12, overflowX:'auto', minWidth:900 }}>
        {ETAPAS.map(etapa => {
          const colDeals = deals.filter(d => d.etapa === etapa.id)
          const total = colDeals.reduce((s, d) => s + (d.valor || 0), 0)
          return (
            <div key={etapa.id} style={{ minWidth:160 }}>
              <div style={{ padding:'10px 12px', borderRadius:'8px 8px 0 0', background: `${etapa.color}20`, borderBottom:`2px solid ${etapa.color}`, marginBottom:8 }}>
                <div style={{ fontSize:12, fontWeight:700, color:etapa.color }}>{etapa.label}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{colDeals.length} deals · R$ {total.toLocaleString('pt-BR',{maximumFractionDigits:0})}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, minHeight:120 }}>
                {colDeals.map(deal => (
                  <div key={deal.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:12 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>{deal.titulo}</div>
                    {deal.empresa && <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8 }}>{deal.empresa.nome}</div>}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontSize:12, color:'var(--success)', fontWeight:600 }}>R$ {(deal.valor||0).toLocaleString('pt-BR',{maximumFractionDigits:0})}</span>
                      <span style={{ fontSize:10, background:`${etapa.color}20`, color:etapa.color, padding:'2px 6px', borderRadius:10 }}>{deal.probabilidade}%</span>
                    </div>
                    {/* Mover */}
                    <div style={{ display:'flex', gap:4, marginTop:8, flexWrap:'wrap' }}>
                      {ETAPAS.filter(e => e.id !== etapa.id).slice(0,2).map(e => (
                        <button key={e.id} onClick={() => moverEtapa(deal, e.id)} style={{ fontSize:9, padding:'2px 6px', background:`${e.color}15`, color:e.color, border:'none', borderRadius:4, cursor:'pointer' }}>→ {e.label.replace(' ✓','').replace(' ✗','')}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {colDeals.length === 0 && <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:12, padding:'20px 0', border:'1px dashed var(--border)', borderRadius:8 }}>Vazio</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:32, width:480 }}>
            <h2 style={{ margin:'0 0 24px', fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>Novo Deal</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={labelStyle}>Título *</label><input value={form.titulo} onChange={e => setForm({...form, titulo:e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>Empresa</label>
                <select value={form.empresa_id} onChange={e => setForm({...form, empresa_id:e.target.value})} style={inputStyle}>
                  <option value="">Selecione...</option>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={labelStyle}>Valor (R$)</label><input type="number" value={form.valor} onChange={e => setForm({...form, valor:+e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>Probabilidade (%)</label><input type="number" min={0} max={100} value={form.probabilidade} onChange={e => setForm({...form, probabilidade:+e.target.value})} style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>Etapa</label>
                <select value={form.etapa} onChange={e => setForm({...form, etapa:e.target.value})} style={inputStyle}>
                  {ETAPAS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Notas</label><textarea value={form.notas} onChange={e => setForm({...form, notas:e.target.value})} rows={3} style={{ ...inputStyle, resize:'vertical' }} /></div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button onClick={salvar} style={{ flex:1, padding:11, background:'var(--nulink-blue)', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer' }}>Salvar</button>
              <button onClick={() => setModal(false)} style={{ padding:'11px 20px', background:'var(--bg-primary)', color:'var(--text-secondary)', border:'1px solid var(--border)', borderRadius:8, cursor:'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
