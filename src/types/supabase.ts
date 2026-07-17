export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          scopes: string[]
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: string[]
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: string[]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          criado_em: string
          id: string
          operacao: string
          registro_id: string
          tabela: string
          tenant_id: string
          usuario_id: string | null
          valores_antigos: Json | null
          valores_novos: Json | null
        }
        Insert: {
          criado_em?: string
          id?: string
          operacao: string
          registro_id: string
          tabela: string
          tenant_id: string
          usuario_id?: string | null
          valores_antigos?: Json | null
          valores_novos?: Json | null
        }
        Update: {
          criado_em?: string
          id?: string
          operacao?: string
          registro_id?: string
          tabela?: string
          tenant_id?: string
          usuario_id?: string | null
          valores_antigos?: Json | null
          valores_novos?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      aulas: {
        Row: {
          conteudo_texto: string | null
          created_at: string | null
          id: string
          is_global: boolean | null
          modulo_id: string | null
          ordem: number | null
          slides: Json | null
          tenant_id: string | null
          tipo_conteudo: Database["public"]["Enums"]["content_type_enum"] | null
          titulo: string | null
          url_midia: string | null
          xp_reward: number
        }
        Insert: {
          conteudo_texto?: string | null
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          modulo_id?: string | null
          ordem?: number | null
          slides?: Json | null
          tenant_id?: string | null
          tipo_conteudo?:
            | Database["public"]["Enums"]["content_type_enum"]
            | null
          titulo?: string | null
          url_midia?: string | null
          xp_reward?: number
        }
        Update: {
          conteudo_texto?: string | null
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          modulo_id?: string | null
          ordem?: number | null
          slides?: Json | null
          tenant_id?: string | null
          tipo_conteudo?:
            | Database["public"]["Enums"]["content_type_enum"]
            | null
          titulo?: string | null
          url_midia?: string | null
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "aulas_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          cor: string | null
          id: string
          nome: string
          pai_id: string | null
          tenant_id: string | null
        }
        Insert: {
          cor?: string | null
          id?: string
          nome: string
          pai_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          cor?: string | null
          id?: string
          nome?: string
          pai_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_pai_id_fkey"
            columns: ["pai_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes_calculadas: {
        Row: {
          aprovado: boolean
          aprovado_por: string | null
          bonus_total: number | null
          calculado_em: string
          comissao_base: number | null
          detalhamento: Json | null
          id: string
          periodo_id: number
          tenant_id: string
          total: number | null
          vendedor_id: string
        }
        Insert: {
          aprovado?: boolean
          aprovado_por?: string | null
          bonus_total?: number | null
          calculado_em?: string
          comissao_base?: number | null
          detalhamento?: Json | null
          id?: string
          periodo_id: number
          tenant_id: string
          total?: number | null
          vendedor_id: string
        }
        Update: {
          aprovado?: boolean
          aprovado_por?: string | null
          bonus_total?: number | null
          calculado_em?: string
          comissao_base?: number | null
          detalhamento?: Json | null
          id?: string
          periodo_id?: number
          tenant_id?: string
          total?: number | null
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_calculadas_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_calculadas_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_calculadas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_calculadas_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_id_mappings: {
        Row: {
          canonical_id: string | null
          created_at: string | null
          entity_type: string
          id: string
          source_id: string
          source_system: string
          tenant_id: string
        }
        Insert: {
          canonical_id?: string | null
          created_at?: string | null
          entity_type: string
          id?: string
          source_id: string
          source_system: string
          tenant_id: string
        }
        Update: {
          canonical_id?: string | null
          created_at?: string | null
          entity_type?: string
          id?: string
          source_id?: string
          source_system?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_id_mappings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      connectors: {
        Row: {
          base_url: string
          created_at: string | null
          credential_secret_id: string
          enabled: boolean | null
          id: string
          last_sync_at: string | null
          last_sync_error: string | null
          settings: Json | null
          system: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          base_url?: string
          created_at?: string | null
          credential_secret_id?: string
          enabled?: boolean | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          settings?: Json | null
          system: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          base_url?: string
          created_at?: string | null
          credential_secret_id?: string
          enabled?: boolean | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          settings?: Json | null
          system?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connectors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      convites: {
        Row: {
          criado_em: string
          criado_por: string
          email: string | null
          expira_em: string
          id: string
          loja: string | null
          loja_id: string | null
          role: string
          tenant_id: string
          token: string
          usado: boolean
        }
        Insert: {
          criado_em?: string
          criado_por: string
          email?: string | null
          expira_em?: string
          id?: string
          loja?: string | null
          loja_id?: string | null
          role: string
          tenant_id: string
          token?: string
          usado?: boolean
        }
        Update: {
          criado_em?: string
          criado_por?: string
          email?: string | null
          expira_em?: string
          id?: string
          loja?: string | null
          loja_id?: string | null
          role?: string
          tenant_id?: string
          token?: string
          usado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "convites_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_layouts: {
        Row: {
          id: string
          nome: string
          tenant_id: string
          updated_at: string
          usuario_id: string
          widgets: Json
        }
        Insert: {
          id?: string
          nome?: string
          tenant_id: string
          updated_at?: string
          usuario_id: string
          widgets?: Json
        }
        Update: {
          id?: string
          nome?: string
          tenant_id?: string
          updated_at?: string
          usuario_id?: string
          widgets?: Json
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_layouts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_layouts_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gamificacao: {
        Row: {
          badges: Json
          nivel: number
          streak_dias: number
          ultimo_acesso: string | null
          usuario_id: string
          xp_total: number
        }
        Insert: {
          badges?: Json
          nivel?: number
          streak_dias?: number
          ultimo_acesso?: string | null
          usuario_id: string
          xp_total?: number
        }
        Update: {
          badges?: Json
          nivel?: number
          streak_dias?: number
          ultimo_acesso?: string | null
          usuario_id?: string
          xp_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "gamificacao_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gerente_permissions: {
        Row: {
          id: string
          permissions: Json
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          permissions?: Json
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          permissions?: Json
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gerente_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          bonus1: number
          bonus2: number
          bonus3: number
          commission_pct: number
          commission_type: string
          created_at: string
          history_months: number | null
          id: number
          meta1: number
          meta2: number
          meta3: number
          period_id: number
          store: string
          tenant_id: string
          vendor_id: string
          vendor_name: string
        }
        Insert: {
          bonus1?: number
          bonus2?: number
          bonus3?: number
          commission_pct?: number
          commission_type?: string
          created_at?: string
          history_months?: number | null
          id?: number
          meta1: number
          meta2: number
          meta3: number
          period_id: number
          store: string
          tenant_id: string
          vendor_id: string
          vendor_name: string
        }
        Update: {
          bonus1?: number
          bonus2?: number
          bonus3?: number
          commission_pct?: number
          commission_type?: string
          created_at?: string
          history_months?: number | null
          id?: number
          meta1?: number
          meta2?: number
          meta3?: number
          period_id?: number
          store?: string
          tenant_id?: string
          vendor_id?: string
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_absences: {
        Row: {
          absence_date: string
          created_at: string | null
          created_by: string | null
          free_day_id: string | null
          id: string
          notes: string | null
          type: string
          user_id: string
        }
        Insert: {
          absence_date: string
          created_at?: string | null
          created_by?: string | null
          free_day_id?: string | null
          id?: string
          notes?: string | null
          type: string
          user_id: string
        }
        Update: {
          absence_date?: string
          created_at?: string | null
          created_by?: string | null
          free_day_id?: string | null
          id?: string
          notes?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_absences_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_absences_free_day_id_fkey"
            columns: ["free_day_id"]
            isOneToOne: false
            referencedRelation: "hr_free_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_absences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_delays: {
        Row: {
          created_at: string
          delay_date: string
          delay_minutes: number
          id: string
          justification: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delay_date: string
          delay_minutes?: number
          id?: string
          justification?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delay_date?: string
          delay_minutes?: number
          id?: string
          justification?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_delays_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_free_days: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string
          id: string
          issued_at: string
          notes: string | null
          status: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          id?: string
          issued_at?: string
          notes?: string | null
          status?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          id?: string
          issued_at?: string
          notes?: string | null
          status?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_free_days_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_free_days_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_permissions: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          requested_by: string | null
          requested_date: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          requested_by?: string | null
          requested_date: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          requested_by?: string | null
          requested_date?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_permissions_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_permissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_vacations: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          notes: string | null
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_vacations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_vacations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_venda: {
        Row: {
          categoria_raw: string | null
          id: string
          produto_id: string | null
          produto_raw: string | null
          quantidade: number
          valor_total: number | null
          valor_unit: number | null
          venda_id: string
        }
        Insert: {
          categoria_raw?: string | null
          id?: string
          produto_id?: string | null
          produto_raw?: string | null
          quantidade?: number
          valor_total?: number | null
          valor_unit?: number | null
          venda_id: string
        }
        Update: {
          categoria_raw?: string | null
          id?: string
          produto_id?: string | null
          produto_raw?: string | null
          quantidade?: number
          valor_total?: number | null
          valor_unit?: number | null
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_venda_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_venda_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos: {
        Row: {
          aprovacao_minima: number
          created_at: string | null
          descricao: string | null
          id: string
          ordem: number
          tenant_id: string | null
          titulo: string
          trilha_id: string
          xp_reward: number
        }
        Insert: {
          aprovacao_minima?: number
          created_at?: string | null
          descricao?: string | null
          id?: string
          ordem?: number
          tenant_id?: string | null
          titulo: string
          trilha_id: string
          xp_reward?: number
        }
        Update: {
          aprovacao_minima?: number
          created_at?: string | null
          descricao?: string | null
          id?: string
          ordem?: number
          tenant_id?: string | null
          titulo?: string
          trilha_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "modulos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modulos_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas"
            referencedColumns: ["id"]
          },
        ]
      }
      periods: {
        Row: {
          closed: boolean
          created_at: string
          end_date: string
          id: number
          label: string
          month: number
          start_date: string
          tenant_id: string
          year: number
        }
        Insert: {
          closed?: boolean
          created_at?: string
          end_date: string
          id?: number
          label: string
          month: number
          start_date: string
          tenant_id: string
          year: number
        }
        Update: {
          closed?: boolean
          created_at?: string
          end_date?: string
          id?: number
          label?: string
          month?: number
          start_date?: string
          tenant_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "periods_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          cost_price: number | null
          id: string
          margin_pct: number | null
          name: string | null
          period_id: number
          product_code: string
          sale_price: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
          id?: string
          margin_pct?: number | null
          name?: string | null
          period_id: number
          product_code: string
          sale_price?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_price?: number | null
          id?: string
          margin_pct?: number | null
          name?: string | null
          period_id?: number
          product_code?: string
          sale_price?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria_id: string | null
          id: string
          marca: string | null
          modelo: string | null
          nome: string
          sku: string | null
          tenant_id: string | null
        }
        Insert: {
          ativo?: boolean
          categoria_id?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          nome: string
          sku?: string | null
          tenant_id?: string | null
        }
        Update: {
          ativo?: boolean
          categoria_id?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          nome?: string
          sku?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          created_at: string
          data_admissao: string | null
          id: string
          income_currency: string | null
          monthly_income: number | null
          name: string
          numero_vendedor: string | null
          role: Database["public"]["Enums"]["user_role"]
          store: string | null
          tenant_id: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_admissao?: string | null
          id: string
          income_currency?: string | null
          monthly_income?: number | null
          name: string
          numero_vendedor?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          store?: string | null
          tenant_id?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_admissao?: string | null
          id?: string
          income_currency?: string | null
          monthly_income?: number | null
          name?: string
          numero_vendedor?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          store?: string | null
          tenant_id?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_aulas: {
        Row: {
          aula_id: string | null
          concluida_em: string | null
          id: string
          tenant_id: string | null
          usuario_id: string | null
        }
        Insert: {
          aula_id?: string | null
          concluida_em?: string | null
          id?: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          aula_id?: string | null
          concluida_em?: string | null
          id?: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progresso_aulas_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_aulas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_modulos: {
        Row: {
          aprovado: boolean | null
          concluido_em: string | null
          id: string
          modulo_id: string | null
          nota_prova: number | null
          tenant_id: string | null
          usuario_id: string | null
        }
        Insert: {
          aprovado?: boolean | null
          concluido_em?: string | null
          id?: string
          modulo_id?: string | null
          nota_prova?: number | null
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          aprovado?: boolean | null
          concluido_em?: string | null
          id?: string
          modulo_id?: string | null
          nota_prova?: number | null
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progresso_modulos_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_modulos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      provas: {
        Row: {
          created_at: string | null
          id: string
          modulo_id: string | null
          nota_minima: number | null
          tenant_id: string | null
          titulo: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          modulo_id?: string | null
          nota_minima?: number | null
          tenant_id?: string | null
          titulo?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          modulo_id?: string | null
          nota_minima?: number | null
          tenant_id?: string | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provas_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      questoes_prova: {
        Row: {
          created_at: string | null
          explicacao: string | null
          id: string
          indice_correta: number | null
          opcoes: Json | null
          pergunta: string | null
          prova_id: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          explicacao?: string | null
          id?: string
          indice_correta?: number | null
          opcoes?: Json | null
          pergunta?: string | null
          prova_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          explicacao?: string | null
          id?: string
          indice_correta?: number | null
          opcoes?: Json | null
          pergunta?: string | null
          prova_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questoes_prova_prova_id_fkey"
            columns: ["prova_id"]
            isOneToOne: false
            referencedRelation: "provas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_prova_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_resultados: {
        Row: {
          aprovado: boolean
          criado_em: string
          id: string
          modulo_id: string
          pontuacao: number
          respostas: Json | null
          tentativa: number
          usuario_id: string
        }
        Insert: {
          aprovado: boolean
          criado_em?: string
          id?: string
          modulo_id: string
          pontuacao: number
          respostas?: Json | null
          tentativa?: number
          usuario_id: string
        }
        Update: {
          aprovado?: boolean
          criado_em?: string
          id?: string
          modulo_id?: string
          pontuacao?: number
          respostas?: Json | null
          tentativa?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_resultados_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_resultados_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          aula_id: string | null
          created_at: string | null
          id: string
          indice_correta: number | null
          opcoes: Json | null
          pergunta: string | null
          tenant_id: string | null
        }
        Insert: {
          aula_id?: string | null
          created_at?: string | null
          id?: string
          indice_correta?: number | null
          opcoes?: Json | null
          pergunta?: string | null
          tenant_id?: string | null
        }
        Update: {
          aula_id?: string | null
          created_at?: string | null
          id?: string
          indice_correta?: number | null
          opcoes?: Json | null
          pergunta?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count: number
          key: string
          window_start: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      regras_comissao: {
        Row: {
          acao: Json
          ativo: boolean
          condicoes: Json
          criado_em: string
          criado_por: string | null
          descricao: string | null
          id: string
          nome: string
          prioridade: number
          tenant_id: string
        }
        Insert: {
          acao: Json
          ativo?: boolean
          condicoes: Json
          criado_em?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          nome: string
          prioridade?: number
          tenant_id: string
        }
        Update: {
          acao?: Json
          ativo?: boolean
          condicoes?: Json
          criado_em?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          prioridade?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "regras_comissao_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_comissao_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          order_id: string
          period_id: number
          product_code: string
          qty: number
          tenant_id: string
          total_price: number
          total_profit: number | null
          unit_cost: number | null
          unit_price: number
          vendor_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          order_id: string
          period_id: number
          product_code: string
          qty?: number
          tenant_id: string
          total_price: number
          total_profit?: number | null
          unit_cost?: number | null
          unit_price: number
          vendor_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          order_id?: string
          period_id?: number
          product_code?: string
          qty?: number
          tenant_id?: string
          total_price?: number
          total_profit?: number | null
          unit_cost?: number | null
          unit_price?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_records: {
        Row: {
          client_id: string
          client_name: string
          created_at: string
          id: number
          order_ref: string | null
          period_id: number
          quantity: number
          sale_date: string
          sale_time: string | null
          store: string
          tenant_id: string
          valor: number
          vendor_id: string
          vendor_name: string
        }
        Insert: {
          client_id: string
          client_name: string
          created_at?: string
          id?: number
          order_ref?: string | null
          period_id: number
          quantity?: number
          sale_date: string
          sale_time?: string | null
          store: string
          tenant_id: string
          valor: number
          vendor_id: string
          vendor_name: string
        }
        Update: {
          client_id?: string
          client_name?: string
          created_at?: string
          id?: number
          order_ref?: string | null
          period_id?: number
          quantity?: number
          sale_date?: string
          sale_time?: string | null
          store?: string
          tenant_id?: string
          valor?: number
          vendor_id?: string
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_records_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_snapshots: {
        Row: {
          created_at: string
          id: string
          product_code: string
          quantity: number
          snapshot_date: string
          source: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_code: string
          quantity: number
          snapshot_date: string
          source?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_code?: string
          quantity?: number
          snapshot_date?: string
          source?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_snapshots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          ativo: boolean
          color: string
          created_at: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          ativo?: boolean
          color: string
          created_at?: string
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          ativo?: boolean
          color?: string
          created_at?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          ativo: boolean
          commission_pct_default: number
          cor_primaria: string
          criado_em: string
          id: string
          locale: string
          logo_url: string | null
          moeda_padrao: string
          nome: string
          plano: string
          slug: string
        }
        Insert: {
          ativo?: boolean
          commission_pct_default?: number
          cor_primaria?: string
          criado_em?: string
          id?: string
          locale?: string
          logo_url?: string | null
          moeda_padrao?: string
          nome: string
          plano?: string
          slug: string
        }
        Update: {
          ativo?: boolean
          commission_pct_default?: number
          cor_primaria?: string
          criado_em?: string
          id?: string
          locale?: string
          logo_url?: string | null
          moeda_padrao?: string
          nome?: string
          plano?: string
          slug?: string
        }
        Relationships: []
      }
      trilhas: {
        Row: {
          ativa: boolean
          cor: string | null
          created_at: string | null
          descricao: string | null
          icon: string | null
          id: string
          is_global: boolean
          ordem: number
          publico_alvo: string | null
          tenant_id: string | null
          titulo: string
        }
        Insert: {
          ativa?: boolean
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icon?: string | null
          id?: string
          is_global?: boolean
          ordem?: number
          publico_alvo?: string | null
          tenant_id?: string | null
          titulo: string
        }
        Update: {
          ativa?: boolean
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icon?: string | null
          id?: string
          is_global?: boolean
          ordem?: number
          publico_alvo?: string | null
          tenant_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "trilhas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          criado_em: string
          data_venda: string
          fonte: string
          id: string
          loja_id: string | null
          periodo_id: number | null
          raw_ref: string | null
          tenant_id: string
          total: number | null
          vendedor_id: string | null
        }
        Insert: {
          criado_em?: string
          data_venda: string
          fonte?: string
          id?: string
          loja_id?: string | null
          periodo_id?: number | null
          raw_ref?: string | null
          tenant_id: string
          total?: number | null
          vendedor_id?: string | null
        }
        Update: {
          criado_em?: string
          data_venda?: string
          fonte?: string
          id?: string
          loja_id?: string | null
          periodo_id?: number | null
          raw_ref?: string | null
          tenant_id?: string
          total?: number | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_exclusions: {
        Row: {
          reason: string | null
          tenant_id: string
          vendor_id: string
        }
        Insert: {
          reason?: string | null
          tenant_id: string
          vendor_id: string
        }
        Update: {
          reason?: string | null
          tenant_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_exclusions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_types: {
        Row: {
          config_schema: Json | null
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          config_schema?: Json | null
          descricao?: string | null
          id: string
          nome: string
        }
        Update: {
          config_schema?: Json | null
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
    }
    Views: {
      client_category_mix: {
        Row: {
          category: string | null
          client_id: string | null
          period_id: number | null
          qty: number | null
          tenant_id: string | null
          total: number | null
          vendor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portfolio: {
        Row: {
          avg_items_per_order: number | null
          avg_ticket: number | null
          client_id: string | null
          client_name: string | null
          days_since_last: number | null
          first_purchase: string | null
          last_purchase: string | null
          last_purchase_time: string | null
          period_id: number | null
          tenant_id: string | null
          total_items: number | null
          total_orders: number | null
          total_spent: number | null
          vendor_id: string | null
          visit_days: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_records_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_summary: {
        Row: {
          avg_ticket: number | null
          bonus_earned: number | null
          bonus1: number | null
          bonus2: number | null
          bonus3: number | null
          commission_pct: number | null
          commission_type: string | null
          last_sale_date: string | null
          last_sale_time: string | null
          meta_level: number | null
          meta1: number | null
          meta2: number | null
          meta3: number | null
          month: number | null
          period_id: number | null
          period_label: string | null
          store: string | null
          tenant_id: string | null
          total_commission: number | null
          total_items: number | null
          total_orders: number | null
          total_profit: number | null
          total_sold: number | null
          unique_clients: number | null
          vendor_id: string | null
          vendor_name: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_records_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_vendor_goals: {
        Args: { p_period_id: number; p_tenant_id: string }
        Returns: undefined
      }
      check_rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: boolean
      }
      get_user_tenant_id: { Args: never; Returns: string }
      increment_user_xp: {
        Args: { p_user_id: string; p_xp_to_add: number }
        Returns: undefined
      }
      ingest_sales_records: {
        Args: { p_rows: Json; p_tenant_id: string }
        Returns: number
      }
      is_lms_editor: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      lms_grant_xp: {
        Args: { p_amount: number; p_user: string }
        Returns: {
          badges: Json
          nivel: number
          streak_dias: number
          ultimo_acesso: string | null
          usuario_id: string
          xp_total: number
        }
        SetofOptions: {
          from: "*"
          to: "gamificacao"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      register_absence_with_free_day: {
        Args: {
          p_absence_date: string
          p_free_day_id: string
          p_notes?: string
          p_user_id: string
        }
        Returns: undefined
      }
      store_daily_evolution: {
        Args: { p_period_id: number }
        Returns: {
          avg_ticket: number
          clients: number
          sale_date: string
          store: string
          total: number
          transactions: number
          vendors_active: number
        }[]
      }
      store_daily_evolution_multi: {
        Args: { p_period_ids: number[]; p_tenant_id: string }
        Returns: {
          day_total: number
          period_id: number
          sale_date: string
        }[]
      }
      vendor_evolution: {
        Args: { p_vendor_id: string }
        Returns: {
          bonus_earned: number
          meta_level: number
          meta1: number
          meta2: number
          meta3: number
          month: number
          period_label: string
          total_items: number
          total_sold: number
          unique_clients: number
          year: number
        }[]
      }
    }
    Enums: {
      content_type_enum: "video" | "pdf" | "slide" | "texto"
      user_role: "adm" | "vendedor" | "gerente" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_type_enum: ["video", "pdf", "slide", "texto"],
      user_role: ["adm", "vendedor", "gerente", "super_admin"],
    },
  },
} as const
