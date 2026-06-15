const colors: Record<string, string> = {
  ativo: 'var(--success)', lead: 'var(--nulink-blue)', prospecto: '#8B5CF6',
  inativo: 'var(--text-muted)', churned: 'var(--danger)', pendente: 'var(--warning)',
  fechado_ganho: 'var(--success)', fechado_perdido: 'var(--danger)',
  prospeccao: 'var(--text-secondary)', qualificacao: '#8B5CF6',
  proposta: 'var(--nulink-blue)', negociacao: 'var(--warning)',
  alta: 'var(--danger)', media: 'var(--warning)', baixa: 'var(--success)', urgente: '#FF0066',
  em_progresso: 'var(--nulink-blue)', concluida: 'var(--success)', cancelada: 'var(--danger)'
}

export default function Badge({ value }: { value: string }) {
  const color = colors[value] || 'var(--text-muted)'
  const label = value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, background: `${color}20`, color,
      border: `1px solid ${color}40`, textTransform: 'capitalize', whiteSpace: 'nowrap'
    }}>{label}</span>
  )
}
