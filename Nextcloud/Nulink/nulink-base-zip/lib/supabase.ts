import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  global: {
    headers: {
      'Prefer': 'return=representation'
    }
  }
})

export type Usuario = {
  id: string; nome: string; email: string; role: string; avatar_url?: string; ativo: boolean; created_at: string
}
export type Empresa = {
  id: string; nome: string; cnpj?: string; segmento?: string; porte?: string; cidade?: string; estado?: string
  website?: string; telefone?: string; email_contato?: string; responsavel_id?: string; status: string
  plano?: string; mrr: number; origem?: string; tags?: string[]; notas?: string; created_at: string; updated_at: string
}
export type Profissional = {
  id: string; nome: string; cpf?: string; email?: string; telefone?: string; whatsapp?: string
  cidade?: string; estado?: string; especialidades?: string[]; certificacoes?: string[]
  trust_score: number; disponivel: boolean; empresa_id?: string; status: string; notas?: string
  created_at: string; updated_at: string
}
export type Deal = {
  id: string; titulo: string; empresa_id?: string; responsavel_id?: string; etapa: string
  valor: number; probabilidade: number; data_fechamento_previsto?: string; data_fechamento?: string
  motivo_perda?: string; notas?: string; created_at: string; updated_at: string
  empresa?: Empresa
}
export type Atividade = {
  id: string; tipo: string; titulo: string; descricao?: string; empresa_id?: string
  deal_id?: string; profissional_id?: string; responsavel_id?: string
  data_atividade: string; concluida: boolean; data_conclusao?: string; created_at: string
}
export type Tarefa = {
  id: string; titulo: string; descricao?: string; responsavel_id?: string; empresa_id?: string
  deal_id?: string; prioridade: string; status: string; data_vencimento?: string
  data_conclusao?: string; created_at: string; updated_at: string
}
