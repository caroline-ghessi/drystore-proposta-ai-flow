export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      calculos_historico: {
        Row: {
          created_at: string | null
          energia_solar_calculo_id: string | null
          etapa: string | null
          formula_utilizada: string | null
          id: string
          inputs: Json | null
          outputs: Json | null
          tempo_processamento_ms: number | null
        }
        Insert: {
          created_at?: string | null
          energia_solar_calculo_id?: string | null
          etapa?: string | null
          formula_utilizada?: string | null
          id?: string
          inputs?: Json | null
          outputs?: Json | null
          tempo_processamento_ms?: number | null
        }
        Update: {
          created_at?: string | null
          energia_solar_calculo_id?: string | null
          etapa?: string | null
          formula_utilizada?: string | null
          id?: string
          inputs?: Json | null
          outputs?: Json | null
          tempo_processamento_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calculos_historico_energia_solar_calculo_id_fkey"
            columns: ["energia_solar_calculo_id"]
            isOneToOne: false
            referencedRelation: "energia_solar_calculos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          updated_at: string
          vendedor_id: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          updated_at?: string
          vendedor_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          updated_at?: string
          vendedor_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      energia_solar_calculos: {
        Row: {
          area_disponivel: number | null
          area_ocupada_m2: number | null
          configuracao_utilizada_id: string | null
          consumo_mensal_kwh: number
          created_at: string | null
          economia_anual_estimada: number | null
          economia_mensal_estimada: number | null
          geracao_estimada_anual_kwh: number | null
          geracao_estimada_mensal_kwh: number | null
          id: string
          inversor_selecionado_id: string | null
          irradiacao_local: number
          painel_selecionado_id: string | null
          payback_descontado_anos: number | null
          payback_simples_anos: number | null
          peso_total_kg: number | null
          potencia_sistema_kwp: number
          proposta_id: string | null
          quantidade_paineis: number
          tipo_instalacao: string | null
          tipo_telha: string | null
          updated_at: string | null
          valor_equipamentos: number | null
          valor_instalacao: number | null
          valor_total: number | null
          vpl_25_anos: number | null
        }
        Insert: {
          area_disponivel?: number | null
          area_ocupada_m2?: number | null
          configuracao_utilizada_id?: string | null
          consumo_mensal_kwh: number
          created_at?: string | null
          economia_anual_estimada?: number | null
          economia_mensal_estimada?: number | null
          geracao_estimada_anual_kwh?: number | null
          geracao_estimada_mensal_kwh?: number | null
          id?: string
          inversor_selecionado_id?: string | null
          irradiacao_local: number
          painel_selecionado_id?: string | null
          payback_descontado_anos?: number | null
          payback_simples_anos?: number | null
          peso_total_kg?: number | null
          potencia_sistema_kwp: number
          proposta_id?: string | null
          quantidade_paineis: number
          tipo_instalacao?: string | null
          tipo_telha?: string | null
          updated_at?: string | null
          valor_equipamentos?: number | null
          valor_instalacao?: number | null
          valor_total?: number | null
          vpl_25_anos?: number | null
        }
        Update: {
          area_disponivel?: number | null
          area_ocupada_m2?: number | null
          configuracao_utilizada_id?: string | null
          consumo_mensal_kwh?: number
          created_at?: string | null
          economia_anual_estimada?: number | null
          economia_mensal_estimada?: number | null
          geracao_estimada_anual_kwh?: number | null
          geracao_estimada_mensal_kwh?: number | null
          id?: string
          inversor_selecionado_id?: string | null
          irradiacao_local?: number
          painel_selecionado_id?: string | null
          payback_descontado_anos?: number | null
          payback_simples_anos?: number | null
          peso_total_kg?: number | null
          potencia_sistema_kwp?: number
          proposta_id?: string | null
          quantidade_paineis?: number
          tipo_instalacao?: string | null
          tipo_telha?: string | null
          updated_at?: string | null
          valor_equipamentos?: number | null
          valor_instalacao?: number | null
          valor_total?: number | null
          vpl_25_anos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "energia_solar_calculos_configuracao_utilizada_id_fkey"
            columns: ["configuracao_utilizada_id"]
            isOneToOne: false
            referencedRelation: "energia_solar_configuracoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "energia_solar_calculos_inversor_selecionado_id_fkey"
            columns: ["inversor_selecionado_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "energia_solar_calculos_painel_selecionado_id_fkey"
            columns: ["painel_selecionado_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "energia_solar_calculos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      energia_solar_configuracoes: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          custo_instalacao_wp: number | null
          fator_perdas: number | null
          fator_seguranca: number | null
          fator_sombreamento: number | null
          id: string
          margem_comercial: number | null
          nome: string
          updated_at: string | null
          vigencia_dias: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          custo_instalacao_wp?: number | null
          fator_perdas?: number | null
          fator_seguranca?: number | null
          fator_sombreamento?: number | null
          id?: string
          margem_comercial?: number | null
          nome: string
          updated_at?: string | null
          vigencia_dias?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          custo_instalacao_wp?: number | null
          fator_perdas?: number | null
          fator_seguranca?: number | null
          fator_sombreamento?: number | null
          id?: string
          margem_comercial?: number | null
          nome?: string
          updated_at?: string | null
          vigencia_dias?: number | null
        }
        Relationships: []
      }
      irradiacao_solar: {
        Row: {
          cidade: string
          created_at: string | null
          data_atualizacao: string | null
          estado: string
          fator_correcao: number | null
          fonte_dados: string | null
          id: string
          irradiacao_media_anual: number
          irradiacao_por_mes: Json | null
          latitude: number | null
          longitude: number | null
          updated_at: string | null
        }
        Insert: {
          cidade: string
          created_at?: string | null
          data_atualizacao?: string | null
          estado: string
          fator_correcao?: number | null
          fonte_dados?: string | null
          id?: string
          irradiacao_media_anual: number
          irradiacao_por_mes?: Json | null
          latitude?: number | null
          longitude?: number | null
          updated_at?: string | null
        }
        Update: {
          cidade?: string
          created_at?: string | null
          data_atualizacao?: string | null
          estado?: string
          fator_correcao?: number | null
          fonte_dados?: string | null
          id?: string
          irradiacao_media_anual?: number
          irradiacao_por_mes?: Json | null
          latitude?: number | null
          longitude?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          created_at: string
          dados_extras: Json | null
          id: string
          lida: boolean
          mensagem: string
          proposta_id: string | null
          tipo: Database["public"]["Enums"]["tipo_notificacao_enum"]
        }
        Insert: {
          created_at?: string
          dados_extras?: Json | null
          id?: string
          lida?: boolean
          mensagem: string
          proposta_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_notificacao_enum"]
        }
        Update: {
          created_at?: string
          dados_extras?: Json | null
          id?: string
          lida?: boolean
          mensagem?: string
          proposta_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_notificacao_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria: string
          compatibilidades: Json | null
          corrente_a: number | null
          created_at: string
          dimensoes: Json | null
          eficiencia: number | null
          especificacoes_tecnicas: Json | null
          fabricante: string | null
          garantia_anos: number | null
          id: string
          nome: string
          peso_kg: number | null
          potencia_wp: number | null
          preco_unitario: number | null
          tensao_v: number | null
          unidade: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria: string
          compatibilidades?: Json | null
          corrente_a?: number | null
          created_at?: string
          dimensoes?: Json | null
          eficiencia?: number | null
          especificacoes_tecnicas?: Json | null
          fabricante?: string | null
          garantia_anos?: number | null
          id?: string
          nome: string
          peso_kg?: number | null
          potencia_wp?: number | null
          preco_unitario?: number | null
          tensao_v?: number | null
          unidade?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          compatibilidades?: Json | null
          corrente_a?: number | null
          created_at?: string
          dimensoes?: Json | null
          eficiencia?: number | null
          especificacoes_tecnicas?: Json | null
          fabricante?: string | null
          garantia_anos?: number | null
          id?: string
          nome?: string
          peso_kg?: number | null
          potencia_wp?: number | null
          preco_unitario?: number | null
          tensao_v?: number | null
          unidade?: string
          updated_at?: string
        }
        Relationships: []
      }
      propostas: {
        Row: {
          arquivo_original: string | null
          cliente_email: string
          cliente_endereco: string | null
          cliente_nome: string
          cliente_whatsapp: string | null
          created_at: string
          dados_extraidos: Json | null
          data_aceitacao: string | null
          data_criacao: string
          data_vencimento: string | null
          data_visualizacao: string | null
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          ocultar_precos_unitarios: boolean
          status: Database["public"]["Enums"]["status_proposta_enum"]
          tipo_proposta: Database["public"]["Enums"]["tipo_proposta_enum"]
          updated_at: string
          url_unica: string
          valor_total: number | null
          vendedor_id: string | null
        }
        Insert: {
          arquivo_original?: string | null
          cliente_email: string
          cliente_endereco?: string | null
          cliente_nome: string
          cliente_whatsapp?: string | null
          created_at?: string
          dados_extraidos?: Json | null
          data_aceitacao?: string | null
          data_criacao?: string
          data_vencimento?: string | null
          data_visualizacao?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          ocultar_precos_unitarios?: boolean
          status?: Database["public"]["Enums"]["status_proposta_enum"]
          tipo_proposta: Database["public"]["Enums"]["tipo_proposta_enum"]
          updated_at?: string
          url_unica?: string
          valor_total?: number | null
          vendedor_id?: string | null
        }
        Update: {
          arquivo_original?: string | null
          cliente_email?: string
          cliente_endereco?: string | null
          cliente_nome?: string
          cliente_whatsapp?: string | null
          created_at?: string
          dados_extraidos?: Json | null
          data_aceitacao?: string | null
          data_criacao?: string
          data_vencimento?: string | null
          data_visualizacao?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          ocultar_precos_unitarios?: boolean
          status?: Database["public"]["Enums"]["status_proposta_enum"]
          tipo_proposta?: Database["public"]["Enums"]["tipo_proposta_enum"]
          updated_at?: string
          url_unica?: string
          valor_total?: number | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      vendedores: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          senha: string | null
          tipo: Database["public"]["Enums"]["tipo_usuario_enum"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome: string
          senha?: string | null
          tipo?: Database["public"]["Enums"]["tipo_usuario_enum"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          senha?: string | null
          tipo?: Database["public"]["Enums"]["tipo_usuario_enum"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_orcamento: {
        Args: {
          p_painel_id: string
          p_quantidade_paineis: number
          p_inversor_id: string
          p_potencia_sistema: number
        }
        Returns: Json
      }
      calcular_payback: {
        Args: {
          p_valor_investimento: number
          p_economia_mensal: number
          p_tarifa_energia?: number
          p_taxa_desconto?: number
        }
        Returns: Json
      }
      dimensionar_sistema: {
        Args: {
          p_consumo_kwh: number
          p_cidade: string
          p_estado: string
          p_tipo_instalacao?: string
        }
        Returns: Json
      }
      selecionar_equipamentos: {
        Args: {
          p_potencia_kwp: number
          p_tipo_telha?: string
          p_area_disponivel?: number
        }
        Returns: Json
      }
    }
    Enums: {
      status_proposta_enum:
        | "processando"
        | "enviada"
        | "visualizada"
        | "aceita"
        | "expirada"
      tipo_notificacao_enum:
        | "visualizacao"
        | "aceitacao"
        | "contato"
        | "vencimento"
      tipo_proposta_enum:
        | "energia-solar"
        | "telhas"
        | "divisorias"
        | "pisos"
        | "forros"
        | "materiais-construcao"
        | "tintas-texturas"
        | "verga-fibra"
        | "argamassa-silentfloor"
        | "light-steel-frame"
      tipo_usuario_enum: "administrador" | "vendedor" | "representante"
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
      status_proposta_enum: [
        "processando",
        "enviada",
        "visualizada",
        "aceita",
        "expirada",
      ],
      tipo_notificacao_enum: [
        "visualizacao",
        "aceitacao",
        "contato",
        "vencimento",
      ],
      tipo_proposta_enum: [
        "energia-solar",
        "telhas",
        "divisorias",
        "pisos",
        "forros",
        "materiais-construcao",
        "tintas-texturas",
        "verga-fibra",
        "argamassa-silentfloor",
        "light-steel-frame",
      ],
      tipo_usuario_enum: ["administrador", "vendedor", "representante"],
    },
  },
} as const
