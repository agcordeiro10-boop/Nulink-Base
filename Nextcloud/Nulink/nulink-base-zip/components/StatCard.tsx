import { LucideIcon } from 'lucide-react'

interface Props {
  label: string; value: string | number; icon: LucideIcon
  change?: string; changeType?: 'up' | 'down' | 'neutral'; color?: string
}

export default function StatCard({ label, value, icon: Icon, change, changeType = 'neutral', color = 'var(--nulink-blue)' }: Props) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: `${color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{value}</div>
      {change && (
        <div style={{ fontSize: 12, color: changeType === 'up' ? 'var(--success)' : changeType === 'down' ? 'var(--danger)' : 'var(--text-muted)' }}>
          {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '•'} {change}
        </div>
      )}
    </div>
  )
}
