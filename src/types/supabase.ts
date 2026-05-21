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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booked_by: string
          check_in_date: string | null
          check_out_date: string | null
          created_at: string
          date: string | null
          end_time: string | null
          id: string
          notes: string | null
          org_id: string
          pet_id: string
          price: number
          service_id: string
          staff_id: string | null
          start_time: string | null
          status: string
          type: string
        }
        Insert: {
          booked_by: string
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string
          date?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          org_id: string
          pet_id: string
          price: number
          service_id: string
          staff_id?: string | null
          start_time?: string | null
          status?: string
          type: string
        }
        Update: {
          booked_by?: string
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string
          date?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          pet_id?: string
          price?: number
          service_id?: string
          staff_id?: string | null
          start_time?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "org_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_registers: {
        Row: {
          closed_at: string | null
          closing_balance: number | null
          created_at: string
          expected_balance: number | null
          id: string
          notes: string | null
          opened_at: string
          opened_by: string
          opening_balance: number
          org_id: string
          status: string
        }
        Insert: {
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string
          expected_balance?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by: string
          opening_balance?: number
          org_id: string
          status?: string
        }
        Update: {
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string
          expected_balance?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by?: string
          opening_balance?: number
          org_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_registers_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "org_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_registers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      clients: {
        Row: {
          address: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          org_id: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      convites: {
        Row: {
          criado_em: string
          criado_por: string
          email: string | null
          expira_em: string
          id: string
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
      financial_categories: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          org_id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          org_id: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          org_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_entries: {
        Row: {
          amount: number
          booking_id: string | null
          cash_register_id: string | null
          category_id: string
          created_at: string
          date: string
          description: string | null
          id: string
          org_id: string
          payment_method: string | null
          type: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          cash_register_id?: string | null
          category_id: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          org_id: string
          payment_method?: string | null
          type: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          cash_register_id?: string | null
          category_id?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          org_id?: string
          payment_method?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_entries_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      goals: {
        Row: {
          bonus1: number
          bonus2: number
          bonus3: number
          commission_pct: number
          created_at: string
          history_months: number | null
          id: number
          meta1: number
          meta2: number
          meta3: number
          period_id: number
          store: string
          vendor_id: string
          vendor_name: string
        }
        Insert: {
          bonus1?: number
          bonus2?: number
          bonus3?: number
          commission_pct?: number
          created_at?: string
          history_months?: number | null
          id?: number
          meta1: number
          meta2: number
          meta3: number
          period_id: number
          store: string
          vendor_id: string
          vendor_name: string
        }
        Update: {
          bonus1?: number
          bonus2?: number
          bonus3?: number
          commission_pct?: number
          created_at?: string
          history_months?: number | null
          id?: number
          meta1?: number
          meta2?: number
          meta3?: number
          period_id?: number
          store?: string
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
      licoes: {
        Row: {
          conteudo: Json
          id: string
          modulo_id: string
          ordem: number
          tipo: string
          titulo: string
        }
        Insert: {
          conteudo: Json
          id?: string
          modulo_id: string
          ordem?: number
          tipo?: string
          titulo: string
        }
        Update: {
          conteudo?: Json
          id?: string
          modulo_id?: string
          ordem?: number
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "licoes_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos: {
        Row: {
          aprovacao_minima: number
          descricao: string | null
          id: string
          ordem: number
          titulo: string
          trilha_id: string
          xp_reward: number
        }
        Insert: {
          aprovacao_minima?: number
          descricao?: string | null
          id?: string
          ordem?: number
          titulo: string
          trilha_id: string
          xp_reward?: number
        }
        Update: {
          aprovacao_minima?: number
          descricao?: string | null
          id?: string
          ordem?: number
          titulo?: string
          trilha_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "modulos_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas"
            referencedColumns: ["id"]
          },
        ]
      }
      org_memberships: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string | null
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          org_id: string
          role: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          plan: string | null
          settings: Json | null
          slug: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          plan?: string | null
          settings?: Json | null
          slug: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan?: string | null
          settings?: Json | null
          slug?: string
        }
        Relationships: []
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
          year?: number
        }
        Relationships: []
      }
      pets: {
        Row: {
          birth_date: string | null
          breed: string | null
          client_id: string
          created_at: string
          id: string
          name: string
          notes: string | null
          org_id: string
          photo_url: string | null
          size: string | null
          species: string
          weight: number | null
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          client_id: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          org_id: string
          photo_url?: string | null
          size?: string | null
          species: string
          weight?: number | null
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          photo_url?: string | null
          size?: string | null
          species?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          active: boolean
          created_at: string
          data_admissao: string | null
          id: string
          name: string
          numero_vendedor: string | null
          role: Database["public"]["Enums"]["user_role"]
          store: string | null
          tenant_id: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          data_admissao?: string | null
          id: string
          name: string
          numero_vendedor?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          store?: string | null
          tenant_id?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          data_admissao?: string | null
          id?: string
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
      progresso_usuario: {
        Row: {
          concluida: boolean
          concluida_em: string | null
          id: string
          licao_id: string
          usuario_id: string
        }
        Insert: {
          concluida?: boolean
          concluida_em?: string | null
          id?: string
          licao_id: string
          usuario_id: string
        }
        Update: {
          concluida?: boolean
          concluida_em?: string | null
          id?: string
          licao_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_usuario_licao_id_fkey"
            columns: ["licao_id"]
            isOneToOne: false
            referencedRelation: "licoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questoes: {
        Row: {
          alternativas: Json
          enunciado: string
          id: string
          modulo_id: string
          ordem: number
        }
        Insert: {
          alternativas: Json
          enunciado: string
          id?: string
          modulo_id: string
          ordem?: number
        }
        Update: {
          alternativas?: Json
          enunciado?: string
          id?: string
          modulo_id?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questoes_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
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
        ]
      }
      services: {
        Row: {
          active: boolean | null
          created_at: string
          duration_minutes: number | null
          id: string
          name: string
          org_id: string
          price: number
          type: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          name: string
          org_id: string
          price: number
          type: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          name?: string
          org_id?: string
          price?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          ativo: boolean
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
          ativo: boolean
          descricao: string | null
          id: string
          ordem: number
          publico_alvo: string | null
          tenant_id: string | null
          titulo: string
        }
        Insert: {
          ativo?: boolean
          descricao?: string | null
          id?: string
          ordem?: number
          publico_alvo?: string | null
          tenant_id?: string | null
          titulo: string
        }
        Update: {
          ativo?: boolean
          descricao?: string | null
          id?: string
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
          vendor_id: string
        }
        Insert: {
          reason?: string | null
          vendor_id: string
        }
        Update: {
          reason?: string | null
          vendor_id?: string
        }
        Relationships: []
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
      all_vendors: {
        Row: {
          has_goals: boolean | null
          linked_user: string | null
          store: string | null
          vendor_id: string | null
          vendor_name: string | null
        }
        Relationships: []
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
          total_commission: number | null
          total_items: number | null
          total_orders: number | null
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
        ]
      }
    }
    Functions: {
      calculate_vendor_goals: {
        Args: { p_period_id: number }
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
        Args: { p_period_ids: number[] }
        Returns: {
          avg_ticket: number
          clients: number
          day_of_month: number
          period_id: number
          period_label: string
          period_month: number
          period_year: number
          sale_date: string
          store: string
          total: number
          transactions: number
          vendors_active: number
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
      user_role: "adm" | "vendedor"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      user_role: ["adm", "vendedor"],
    },
  },
} as const
