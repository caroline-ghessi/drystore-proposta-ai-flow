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
      calculos_impermeabilizacao: {
        Row: {
          altura_subida: number | null
          area_aplicacao: number
          area_total_impermeabilizar: number | null
          area_vertical: number | null
          com_primer: boolean | null
          com_protecao_mecanica: boolean | null
          com_tela: boolean | null
          com_transito: boolean | null
          contato_agua: string | null
          created_at: string
          exposicao_uv: boolean | null
          id: string
          inclui_primer: boolean | null
          inclui_reforco_cantos: boolean | null
          numero_demaos: number | null
          observacoes: string | null
          perimetro: number | null
          proposta_id: string | null
          quebra_percentual: number | null
          sistema_impermeabilizacao: string | null
          tipo_superficie: string | null
          updated_at: string
          valor_por_m2: number | null
          valor_total: number | null
        }
        Insert: {
          altura_subida?: number | null
          area_aplicacao: number
          area_total_impermeabilizar?: number | null
          area_vertical?: number | null
          com_primer?: boolean | null
          com_protecao_mecanica?: boolean | null
          com_tela?: boolean | null
          com_transito?: boolean | null
          contato_agua?: string | null
          created_at?: string
          exposicao_uv?: boolean | null
          id?: string
          inclui_primer?: boolean | null
          inclui_reforco_cantos?: boolean | null
          numero_demaos?: number | null
          observacoes?: string | null
          perimetro?: number | null
          proposta_id?: string | null
          quebra_percentual?: number | null
          sistema_impermeabilizacao?: string | null
          tipo_superficie?: string | null
          updated_at?: string
          valor_por_m2?: number | null
          valor_total?: number | null
        }
        Update: {
          altura_subida?: number | null
          area_aplicacao?: number
          area_total_impermeabilizar?: number | null
          area_vertical?: number | null
          com_primer?: boolean | null
          com_protecao_mecanica?: boolean | null
          com_tela?: boolean | null
          com_transito?: boolean | null
          contato_agua?: string | null
          created_at?: string
          exposicao_uv?: boolean | null
          id?: string
          inclui_primer?: boolean | null
          inclui_reforco_cantos?: boolean | null
          numero_demaos?: number | null
          observacoes?: string | null
          perimetro?: number | null
          proposta_id?: string | null
          quebra_percentual?: number | null
          sistema_impermeabilizacao?: string | null
          tipo_superficie?: string | null
          updated_at?: string
          valor_por_m2?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calculos_impermeabilizacao_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      calculos_telhado_shingle: {
        Row: {
          area_telhado: number
          created_at: string | null
          id: string
          inclinacao_percentual: number | null
          observacoes: string | null
          proposta_id: string | null
          quantidade_pacotes_arredondada: number | null
          quantidade_pacotes_calculada: number | null
          quebra_percentual: number | null
          telha_shingle_id: string | null
          updated_at: string | null
          valor_por_m2: number | null
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          area_telhado: number
          created_at?: string | null
          id?: string
          inclinacao_percentual?: number | null
          observacoes?: string | null
          proposta_id?: string | null
          quantidade_pacotes_arredondada?: number | null
          quantidade_pacotes_calculada?: number | null
          quebra_percentual?: number | null
          telha_shingle_id?: string | null
          updated_at?: string | null
          valor_por_m2?: number | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          area_telhado?: number
          created_at?: string | null
          id?: string
          inclinacao_percentual?: number | null
          observacoes?: string | null
          proposta_id?: string | null
          quantidade_pacotes_arredondada?: number | null
          quantidade_pacotes_calculada?: number | null
          quebra_percentual?: number | null
          telha_shingle_id?: string | null
          updated_at?: string | null
          valor_por_m2?: number | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calculos_telhado_shingle_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculos_telhado_shingle_telha_shingle_id_fkey"
            columns: ["telha_shingle_id"]
            isOneToOne: false
            referencedRelation: "telhas_shingle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculos_telhado_shingle_telha_shingle_id_fkey"
            columns: ["telha_shingle_id"]
            isOneToOne: false
            referencedRelation: "v_telhas_shingle_resumo"
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
      composicoes_drywall: {
        Row: {
          categoria_componente: string | null
          consumo_por_m2: number | null
          created_at: string | null
          espessura_total: number | null
          id: string
          nome: string
          ordem_montagem: number | null
          produto_id: string | null
          quebra_padrao: number | null
          tipo_parede: string
        }
        Insert: {
          categoria_componente?: string | null
          consumo_por_m2?: number | null
          created_at?: string | null
          espessura_total?: number | null
          id?: string
          nome: string
          ordem_montagem?: number | null
          produto_id?: string | null
          quebra_padrao?: number | null
          tipo_parede: string
        }
        Update: {
          categoria_componente?: string | null
          consumo_por_m2?: number | null
          created_at?: string | null
          espessura_total?: number | null
          id?: string
          nome?: string
          ordem_montagem?: number | null
          produto_id?: string | null
          quebra_padrao?: number | null
          tipo_parede?: string
        }
        Relationships: [
          {
            foreignKeyName: "composicoes_drywall_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_drywall"
            referencedColumns: ["id"]
          },
        ]
      }
      composicoes_mestre: {
        Row: {
          aplicacao: string | null
          ativo: boolean
          categoria: string
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
          valor_total_m2: number
        }
        Insert: {
          aplicacao?: string | null
          ativo?: boolean
          categoria: string
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
          valor_total_m2: number
        }
        Update: {
          aplicacao?: string | null
          ativo?: boolean
          categoria?: string
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
          valor_total_m2?: number
        }
        Relationships: []
      }
      composicoes_shingle: {
        Row: {
          base_calculo: string
          consumo_unitario: number
          created_at: string | null
          id: string
          linha_telha: string | null
          nome_composicao: string
          obrigatorio: boolean | null
          ordem_instalacao: number | null
          produto_id: string | null
          tipo_calculo: string
        }
        Insert: {
          base_calculo: string
          consumo_unitario: number
          created_at?: string | null
          id?: string
          linha_telha?: string | null
          nome_composicao: string
          obrigatorio?: boolean | null
          ordem_instalacao?: number | null
          produto_id?: string | null
          tipo_calculo: string
        }
        Update: {
          base_calculo?: string
          consumo_unitario?: number
          created_at?: string | null
          id?: string
          linha_telha?: string | null
          nome_composicao?: string
          obrigatorio?: boolean | null
          ordem_instalacao?: number | null
          produto_id?: string | null
          tipo_calculo?: string
        }
        Relationships: [
          {
            foreignKeyName: "composicoes_shingle_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_shingle_novo"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_globais: {
        Row: {
          ativo: boolean
          categoria: string
          chave: string
          created_at: string
          descricao: string | null
          id: string
          updated_at: string
          valor: Json
        }
        Insert: {
          ativo?: boolean
          categoria: string
          chave: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: Json
        }
        Update: {
          ativo?: boolean
          categoria?: string
          chave?: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: []
      }
      conhecimento_vendas: {
        Row: {
          ativo: boolean | null
          categoria: string
          conteudo: string
          created_at: string | null
          id: string
          prioridade: number | null
          tags: string[] | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          conteudo: string
          created_at?: string | null
          id?: string
          prioridade?: number | null
          tags?: string[] | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          conteudo?: string
          created_at?: string | null
          id?: string
          prioridade?: number | null
          tags?: string[] | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
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
      followups_ia: {
        Row: {
          created_at: string | null
          enviado: boolean | null
          feedback_vendedor: number | null
          id: string
          mensagem_final: string | null
          mensagem_gerada: string
          modo: string
          prompt_melhoria: string | null
          proposta_id: string | null
          vendedor_id: string | null
        }
        Insert: {
          created_at?: string | null
          enviado?: boolean | null
          feedback_vendedor?: number | null
          id?: string
          mensagem_final?: string | null
          mensagem_gerada: string
          modo?: string
          prompt_melhoria?: string | null
          proposta_id?: string | null
          vendedor_id?: string | null
        }
        Update: {
          created_at?: string | null
          enviado?: boolean | null
          feedback_vendedor?: number | null
          id?: string
          mensagem_final?: string | null
          mensagem_gerada?: string
          modo?: string
          prompt_melhoria?: string | null
          proposta_id?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followups_ia_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_ia_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
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
      itens_calculo_drywall: {
        Row: {
          categoria: string
          consumo_base: number | null
          consumo_com_quebra: number | null
          created_at: string | null
          descricao: string
          id: string
          orcamento_id: string | null
          ordem: number | null
          preco_unitario: number | null
          produto_id: string | null
          quantidade_final: number | null
          quebra_percentual: number | null
          unidade: string
          valor_total: number | null
        }
        Insert: {
          categoria: string
          consumo_base?: number | null
          consumo_com_quebra?: number | null
          created_at?: string | null
          descricao: string
          id?: string
          orcamento_id?: string | null
          ordem?: number | null
          preco_unitario?: number | null
          produto_id?: string | null
          quantidade_final?: number | null
          quebra_percentual?: number | null
          unidade: string
          valor_total?: number | null
        }
        Update: {
          categoria?: string
          consumo_base?: number | null
          consumo_com_quebra?: number | null
          created_at?: string | null
          descricao?: string
          id?: string
          orcamento_id?: string | null
          ordem?: number | null
          preco_unitario?: number | null
          produto_id?: string | null
          quantidade_final?: number | null
          quebra_percentual?: number | null
          unidade?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_calculo_drywall_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos_drywall"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_calculo_drywall_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_drywall"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_calculo_impermeabilizacao: {
        Row: {
          area_aplicacao: number
          calculo_id: string | null
          consumo_m2: number
          created_at: string | null
          funcao: string
          id: string
          ordem_aplicacao: number | null
          preco_unitario: number
          produto_id: string | null
          quantidade_com_quebra: number
          quantidade_necessaria: number | null
          unidades_compra: number
          valor_total: number | null
        }
        Insert: {
          area_aplicacao: number
          calculo_id?: string | null
          consumo_m2: number
          created_at?: string | null
          funcao: string
          id?: string
          ordem_aplicacao?: number | null
          preco_unitario: number
          produto_id?: string | null
          quantidade_com_quebra: number
          quantidade_necessaria?: number | null
          unidades_compra: number
          valor_total?: number | null
        }
        Update: {
          area_aplicacao?: number
          calculo_id?: string | null
          consumo_m2?: number
          created_at?: string | null
          funcao?: string
          id?: string
          ordem_aplicacao?: number | null
          preco_unitario?: number
          produto_id?: string | null
          quantidade_com_quebra?: number
          quantidade_necessaria?: number | null
          unidades_compra?: number
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_calculo_impermeabilizacao_calculo_id_fkey"
            columns: ["calculo_id"]
            isOneToOne: false
            referencedRelation: "calculos_impermeabilizacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_calculo_impermeabilizacao_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_impermeabilizacao"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_composicao: {
        Row: {
          composicao_id: string
          consumo_por_m2: number
          created_at: string
          fator_correcao: number
          id: string
          ordem: number
          produto_id: string
          quebra_aplicada: number
          valor_por_m2: number
          valor_unitario: number
        }
        Insert: {
          composicao_id: string
          consumo_por_m2: number
          created_at?: string
          fator_correcao?: number
          id?: string
          ordem?: number
          produto_id: string
          quebra_aplicada?: number
          valor_por_m2: number
          valor_unitario: number
        }
        Update: {
          composicao_id?: string
          consumo_por_m2?: number
          created_at?: string
          fator_correcao?: number
          id?: string
          ordem?: number
          produto_id?: string
          quebra_aplicada?: number
          valor_por_m2?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_composicao_composicao_id_fkey"
            columns: ["composicao_id"]
            isOneToOne: false
            referencedRelation: "composicoes_mestre"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_composicao_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_mestre"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_orcamento_shingle: {
        Row: {
          created_at: string | null
          descricao: string | null
          dimensao_base: number | null
          especificacoes: Json | null
          fator_com_quebra: number | null
          fator_conversao: number | null
          id: string
          orcamento_id: string | null
          preco_unitario: number | null
          produto_codigo: string
          quantidade_arredondada: number | null
          quantidade_calculada: number | null
          quebra_aplicada: number | null
          tipo_componente: string
          unidade_dimensao: string | null
          unidade_venda: string | null
          valor_total: number | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          dimensao_base?: number | null
          especificacoes?: Json | null
          fator_com_quebra?: number | null
          fator_conversao?: number | null
          id?: string
          orcamento_id?: string | null
          preco_unitario?: number | null
          produto_codigo: string
          quantidade_arredondada?: number | null
          quantidade_calculada?: number | null
          quebra_aplicada?: number | null
          tipo_componente: string
          unidade_dimensao?: string | null
          unidade_venda?: string | null
          valor_total?: number | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          dimensao_base?: number | null
          especificacoes?: Json | null
          fator_com_quebra?: number | null
          fator_conversao?: number | null
          id?: string
          orcamento_id?: string | null
          preco_unitario?: number | null
          produto_codigo?: string
          quantidade_arredondada?: number | null
          quantidade_calculada?: number | null
          quebra_aplicada?: number | null
          tipo_componente?: string
          unidade_dimensao?: string | null
          unidade_venda?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_orcamento_shingle_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos_telhado_shingle"
            referencedColumns: ["id"]
          },
        ]
      }
      layout_configuracoes: {
        Row: {
          ativo: boolean
          configuracao: Json
          configuracao_padrao: boolean
          created_at: string
          created_by: string | null
          descricao: string | null
          estilos_customizados: Json | null
          id: string
          nome: string
          preview_screenshot: string | null
          template_base: string | null
          tipo_proposta: string
          updated_at: string
          variaveis_utilizadas: string[] | null
          versao: number
          versao_editor: number | null
        }
        Insert: {
          ativo?: boolean
          configuracao?: Json
          configuracao_padrao?: boolean
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          estilos_customizados?: Json | null
          id?: string
          nome: string
          preview_screenshot?: string | null
          template_base?: string | null
          tipo_proposta: string
          updated_at?: string
          variaveis_utilizadas?: string[] | null
          versao?: number
          versao_editor?: number | null
        }
        Update: {
          ativo?: boolean
          configuracao?: Json
          configuracao_padrao?: boolean
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          estilos_customizados?: Json | null
          id?: string
          nome?: string
          preview_screenshot?: string | null
          template_base?: string | null
          tipo_proposta?: string
          updated_at?: string
          variaveis_utilizadas?: string[] | null
          versao?: number
          versao_editor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "layout_configuracoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      layout_elementos: {
        Row: {
          configuracao: Json
          created_at: string
          elemento_nome: string
          elemento_tipo: string
          id: string
          layout_id: string
          ordem: number
          updated_at: string
          visivel: boolean
        }
        Insert: {
          configuracao?: Json
          created_at?: string
          elemento_nome: string
          elemento_tipo: string
          id?: string
          layout_id: string
          ordem?: number
          updated_at?: string
          visivel?: boolean
        }
        Update: {
          configuracao?: Json
          created_at?: string
          elemento_nome?: string
          elemento_tipo?: string
          id?: string
          layout_id?: string
          ordem?: number
          updated_at?: string
          visivel?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "layout_elementos_layout_id_fkey"
            columns: ["layout_id"]
            isOneToOne: false
            referencedRelation: "layout_configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      layout_estatisticas: {
        Row: {
          conversoes: number
          created_at: string
          data_evento: string
          id: string
          layout_id: string
          taxa_conversao: number | null
          tempo_medio_visualizacao: unknown | null
          updated_at: string
          visualizacoes: number
        }
        Insert: {
          conversoes?: number
          created_at?: string
          data_evento?: string
          id?: string
          layout_id: string
          taxa_conversao?: number | null
          tempo_medio_visualizacao?: unknown | null
          updated_at?: string
          visualizacoes?: number
        }
        Update: {
          conversoes?: number
          created_at?: string
          data_evento?: string
          id?: string
          layout_id?: string
          taxa_conversao?: number | null
          tempo_medio_visualizacao?: unknown | null
          updated_at?: string
          visualizacoes?: number
        }
        Relationships: [
          {
            foreignKeyName: "layout_estatisticas_layout_id_fkey"
            columns: ["layout_id"]
            isOneToOne: false
            referencedRelation: "layout_configuracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      layout_historico: {
        Row: {
          alterado_por: string | null
          configuracao: Json
          created_at: string
          estilos_customizados: Json | null
          id: string
          layout_id: string
          observacoes: string | null
          versao: number
        }
        Insert: {
          alterado_por?: string | null
          configuracao?: Json
          created_at?: string
          estilos_customizados?: Json | null
          id?: string
          layout_id: string
          observacoes?: string | null
          versao: number
        }
        Update: {
          alterado_por?: string | null
          configuracao?: Json
          created_at?: string
          estilos_customizados?: Json | null
          id?: string
          layout_id?: string
          observacoes?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "layout_historico_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "layout_historico_layout_id_fkey"
            columns: ["layout_id"]
            isOneToOne: false
            referencedRelation: "layout_configuracoes"
            referencedColumns: ["id"]
          },
        ]
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
      orcamentos_drywall: {
        Row: {
          area_parede: number
          composicao_nome: string
          comprimento_linear: number | null
          created_at: string | null
          id: string
          incluir_porta: boolean | null
          incluir_tomadas: boolean | null
          observacoes: string | null
          pe_direito: number | null
          peso_total_kg: number | null
          proposta_id: string | null
          quantidade_portas: number | null
          quantidade_tomadas: number | null
          quebra_isolamento: number | null
          quebra_perfil: number | null
          quebra_placa: number | null
          status: string | null
          tipo_parede: string
          updated_at: string | null
          valor_por_m2: number | null
          valor_total: number | null
        }
        Insert: {
          area_parede: number
          composicao_nome: string
          comprimento_linear?: number | null
          created_at?: string | null
          id?: string
          incluir_porta?: boolean | null
          incluir_tomadas?: boolean | null
          observacoes?: string | null
          pe_direito?: number | null
          peso_total_kg?: number | null
          proposta_id?: string | null
          quantidade_portas?: number | null
          quantidade_tomadas?: number | null
          quebra_isolamento?: number | null
          quebra_perfil?: number | null
          quebra_placa?: number | null
          status?: string | null
          tipo_parede: string
          updated_at?: string | null
          valor_por_m2?: number | null
          valor_total?: number | null
        }
        Update: {
          area_parede?: number
          composicao_nome?: string
          comprimento_linear?: number | null
          created_at?: string | null
          id?: string
          incluir_porta?: boolean | null
          incluir_tomadas?: boolean | null
          observacoes?: string | null
          pe_direito?: number | null
          peso_total_kg?: number | null
          proposta_id?: string | null
          quantidade_portas?: number | null
          quantidade_tomadas?: number | null
          quebra_isolamento?: number | null
          quebra_perfil?: number | null
          quebra_placa?: number | null
          status?: string | null
          tipo_parede?: string
          updated_at?: string | null
          valor_por_m2?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_drywall_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos_telhado_shingle: {
        Row: {
          area_telhado: number
          comprimento_calha: number | null
          comprimento_cumeeira: number | null
          comprimento_rufo_capa: number | null
          comprimento_rufo_lateral: number | null
          cor_acessorios: string | null
          created_at: string | null
          id: string
          incluir_calha: boolean | null
          incluir_manta_starter: boolean | null
          observacoes: string | null
          perimetro_telhado: number | null
          proposta_id: string | null
          quebra_cumeeira: number | null
          quebra_rufo: number | null
          quebra_telha: number | null
          status: string | null
          telha_codigo: string | null
          updated_at: string | null
          valor_por_m2: number | null
          valor_total: number | null
        }
        Insert: {
          area_telhado: number
          comprimento_calha?: number | null
          comprimento_cumeeira?: number | null
          comprimento_rufo_capa?: number | null
          comprimento_rufo_lateral?: number | null
          cor_acessorios?: string | null
          created_at?: string | null
          id?: string
          incluir_calha?: boolean | null
          incluir_manta_starter?: boolean | null
          observacoes?: string | null
          perimetro_telhado?: number | null
          proposta_id?: string | null
          quebra_cumeeira?: number | null
          quebra_rufo?: number | null
          quebra_telha?: number | null
          status?: string | null
          telha_codigo?: string | null
          updated_at?: string | null
          valor_por_m2?: number | null
          valor_total?: number | null
        }
        Update: {
          area_telhado?: number
          comprimento_calha?: number | null
          comprimento_cumeeira?: number | null
          comprimento_rufo_capa?: number | null
          comprimento_rufo_lateral?: number | null
          cor_acessorios?: string | null
          created_at?: string | null
          id?: string
          incluir_calha?: boolean | null
          incluir_manta_starter?: boolean | null
          observacoes?: string | null
          perimetro_telhado?: number | null
          proposta_id?: string | null
          quebra_cumeeira?: number | null
          quebra_rufo?: number | null
          quebra_telha?: number | null
          status?: string | null
          telha_codigo?: string | null
          updated_at?: string | null
          valor_por_m2?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_telhado_shingle_proposta_id_fkey"
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
      produtos_drywall: {
        Row: {
          ativo: boolean | null
          categoria: string
          codigo: string
          created_at: string | null
          descricao: string
          espessura: number | null
          id: string
          peso_unitario: number | null
          preco_unitario: number | null
          tipo_placa: string | null
          unidade_medida: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          codigo: string
          created_at?: string | null
          descricao: string
          espessura?: number | null
          id?: string
          peso_unitario?: number | null
          preco_unitario?: number | null
          tipo_placa?: string | null
          unidade_medida: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          codigo?: string
          created_at?: string | null
          descricao?: string
          espessura?: number | null
          id?: string
          peso_unitario?: number | null
          preco_unitario?: number | null
          tipo_placa?: string | null
          unidade_medida?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      produtos_impermeabilizacao: {
        Row: {
          aplicacoes: string[] | null
          ativo: boolean | null
          categoria: string
          codigo: string
          consumo_m2: number
          created_at: string | null
          fator_multiplicador: number | null
          id: string
          nome: string
          normas: string[] | null
          preco_unitario: number
          quantidade_unidade_venda: number
          quebra_padrao: number | null
          tipo: string
          unidade_medida: string
          unidade_venda: string
          updated_at: string | null
        }
        Insert: {
          aplicacoes?: string[] | null
          ativo?: boolean | null
          categoria: string
          codigo: string
          consumo_m2: number
          created_at?: string | null
          fator_multiplicador?: number | null
          id?: string
          nome: string
          normas?: string[] | null
          preco_unitario: number
          quantidade_unidade_venda: number
          quebra_padrao?: number | null
          tipo: string
          unidade_medida: string
          unidade_venda: string
          updated_at?: string | null
        }
        Update: {
          aplicacoes?: string[] | null
          ativo?: boolean | null
          categoria?: string
          codigo?: string
          consumo_m2?: number
          created_at?: string | null
          fator_multiplicador?: number | null
          id?: string
          nome?: string
          normas?: string[] | null
          preco_unitario?: number
          quantidade_unidade_venda?: number
          quebra_padrao?: number | null
          tipo?: string
          unidade_medida?: string
          unidade_venda?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      produtos_mestre: {
        Row: {
          aplicacao: string | null
          ativo: boolean
          categoria: string
          codigo: string
          created_at: string
          descricao: string
          icms_percentual: number | null
          id: string
          preco_unitario: number
          quantidade_embalagem: number
          quebra_padrao: number
          unidade_medida: string
          updated_at: string
        }
        Insert: {
          aplicacao?: string | null
          ativo?: boolean
          categoria: string
          codigo: string
          created_at?: string
          descricao: string
          icms_percentual?: number | null
          id?: string
          preco_unitario: number
          quantidade_embalagem?: number
          quebra_padrao?: number
          unidade_medida: string
          updated_at?: string
        }
        Update: {
          aplicacao?: string | null
          ativo?: boolean
          categoria?: string
          codigo?: string
          created_at?: string
          descricao?: string
          icms_percentual?: number | null
          id?: string
          preco_unitario?: number
          quantidade_embalagem?: number
          quebra_padrao?: number
          unidade_medida?: string
          updated_at?: string
        }
        Relationships: []
      }
      produtos_shingle_completos: {
        Row: {
          ativo: boolean | null
          codigo: string
          conteudo_unidade: number
          cor: string | null
          created_at: string | null
          descricao: string
          especificacoes_tecnicas: Json | null
          id: string
          linha: string | null
          peso_unitario: number | null
          preco_unitario: number
          quebra_padrao: number | null
          tipo_componente: string
          unidade_medida: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          conteudo_unidade: number
          cor?: string | null
          created_at?: string | null
          descricao: string
          especificacoes_tecnicas?: Json | null
          id?: string
          linha?: string | null
          peso_unitario?: number | null
          preco_unitario: number
          quebra_padrao?: number | null
          tipo_componente: string
          unidade_medida: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          conteudo_unidade?: number
          cor?: string | null
          created_at?: string | null
          descricao?: string
          especificacoes_tecnicas?: Json | null
          id?: string
          linha?: string | null
          peso_unitario?: number | null
          preco_unitario?: number
          quebra_padrao?: number | null
          tipo_componente?: string
          unidade_medida?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      produtos_shingle_novo: {
        Row: {
          ativo: boolean | null
          codigo: string
          conteudo_unidade: number
          cor: string | null
          created_at: string | null
          descricao: string
          especificacoes_tecnicas: Json | null
          id: string
          linha: string | null
          peso_unitario: number | null
          preco_unitario: number
          quebra_padrao: number | null
          tipo_componente: string
          unidade_medida: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          conteudo_unidade: number
          cor?: string | null
          created_at?: string | null
          descricao: string
          especificacoes_tecnicas?: Json | null
          id?: string
          linha?: string | null
          peso_unitario?: number | null
          preco_unitario: number
          quebra_padrao?: number | null
          tipo_componente: string
          unidade_medida: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          conteudo_unidade?: number
          cor?: string | null
          created_at?: string | null
          descricao?: string
          especificacoes_tecnicas?: Json | null
          id?: string
          linha?: string | null
          peso_unitario?: number | null
          preco_unitario?: number
          quebra_padrao?: number | null
          tipo_componente?: string
          unidade_medida?: string
          updated_at?: string | null
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
      telhas_shingle: {
        Row: {
          ativo: boolean | null
          codigo: string
          consumo_m2: number | null
          cor: string | null
          created_at: string | null
          descricao: string
          fator_multiplicador: number | null
          garantia_anos: number | null
          id: string
          linha: string
          peso_kg_m2: number | null
          preco_unitario: number | null
          qtd_unidade_venda: number | null
          quebra_padrao: number | null
          resistencia_vento_kmh: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          consumo_m2?: number | null
          cor?: string | null
          created_at?: string | null
          descricao: string
          fator_multiplicador?: number | null
          garantia_anos?: number | null
          id?: string
          linha: string
          peso_kg_m2?: number | null
          preco_unitario?: number | null
          qtd_unidade_venda?: number | null
          quebra_padrao?: number | null
          resistencia_vento_kmh?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          consumo_m2?: number | null
          cor?: string | null
          created_at?: string | null
          descricao?: string
          fator_multiplicador?: number | null
          garantia_anos?: number | null
          id?: string
          linha?: string
          peso_kg_m2?: number | null
          preco_unitario?: number | null
          qtd_unidade_venda?: number | null
          quebra_padrao?: number | null
          resistencia_vento_kmh?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tipo_proposta_composicoes: {
        Row: {
          ativo: boolean
          composicao_id: string
          created_at: string
          fator_aplicacao: number
          id: string
          obrigatorio: boolean
          ordem_calculo: number
          tipo_proposta: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          composicao_id: string
          created_at?: string
          fator_aplicacao?: number
          id?: string
          obrigatorio?: boolean
          ordem_calculo?: number
          tipo_proposta: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          composicao_id?: string
          created_at?: string
          fator_aplicacao?: number
          id?: string
          obrigatorio?: boolean
          ordem_calculo?: number
          tipo_proposta?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tipo_proposta_composicoes_composicao_id_fkey"
            columns: ["composicao_id"]
            isOneToOne: false
            referencedRelation: "composicoes_mestre"
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
      v_telhas_shingle_resumo: {
        Row: {
          ativo: boolean | null
          codigo: string | null
          cor: string | null
          descricao: string | null
          fator_multiplicador: number | null
          garantia_anos: number | null
          id: string | null
          linha: string | null
          peso_kg_m2: number | null
          preco_unitario: number | null
          qtd_unidade_venda: number | null
          resistencia_vento_kmh: number | null
          valor_por_m2_com_quebra: number | null
        }
        Insert: {
          ativo?: boolean | null
          codigo?: string | null
          cor?: string | null
          descricao?: string | null
          fator_multiplicador?: number | null
          garantia_anos?: number | null
          id?: string | null
          linha?: string | null
          peso_kg_m2?: number | null
          preco_unitario?: number | null
          qtd_unidade_venda?: number | null
          resistencia_vento_kmh?: number | null
          valor_por_m2_com_quebra?: never
        }
        Update: {
          ativo?: boolean | null
          codigo?: string | null
          cor?: string | null
          descricao?: string | null
          fator_multiplicador?: number | null
          garantia_anos?: number | null
          id?: string | null
          linha?: string | null
          peso_kg_m2?: number | null
          preco_unitario?: number | null
          qtd_unidade_venda?: number | null
          resistencia_vento_kmh?: number | null
          valor_por_m2_com_quebra?: never
        }
        Relationships: []
      }
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
      calcular_orcamento_drywall: {
        Args: {
          p_area_parede: number
          p_composicao_nome: string
          p_pe_direito?: number
          p_incluir_porta?: boolean
          p_quantidade_portas?: number
        }
        Returns: {
          categoria: string
          descricao: string
          consumo_base: number
          quebra_percentual: number
          consumo_com_quebra: number
          unidade: string
          quantidade_final: number
          preco_unitario: number
          valor_total: number
          ordem: number
        }[]
      }
      calcular_orcamento_impermeabilizacao: {
        Args: {
          p_area_total: number
          p_tipo_aplicacao?: string
          p_perimetro?: number
          p_altura_subida?: number
          p_com_tela?: boolean
          p_com_primer?: boolean
          p_quebra?: number
          p_produto_principal_id?: string
        }
        Returns: {
          produto_id: string
          produto_codigo: string
          produto_nome: string
          tipo: string
          funcao: string
          consumo_m2: number
          area_aplicacao: number
          quantidade_necessaria: number
          quantidade_com_quebra: number
          unidades_compra: number
          unidade_venda: string
          preco_unitario: number
          valor_total: number
          ordem: number
        }[]
      }
      calcular_orcamento_shingle: {
        Args: {
          p_area_telhado: number
          p_telha_id: string
          p_quebra_percentual?: number
          p_inclinacao?: number
        }
        Returns: Json
      }
      calcular_orcamento_shingle_completo: {
        Args: {
          p_area_telhado: number
          p_comprimento_cumeeira?: number
          p_perimetro_telhado?: number
          p_comprimento_calha?: number
          p_telha_codigo?: string
          p_cor_acessorios?: string
          p_incluir_manta?: boolean
        }
        Returns: {
          tipo_item: string
          codigo: string
          descricao: string
          dimensao_base: number
          unidade_dimensao: string
          fator_conversao: number
          quebra_percentual: number
          quantidade_calculada: number
          quantidade_final: number
          unidade_venda: string
          preco_unitario: number
          valor_total: number
        }[]
      }
      calcular_orcamento_shingle_completo_v2: {
        Args: {
          p_area_telhado: number
          p_comprimento_cumeeira?: number
          p_perimetro_telhado?: number
          p_comprimento_calha?: number
          p_telha_codigo?: string
          p_cor_acessorios?: string
          p_incluir_manta?: boolean
          p_incluir_calha?: boolean
        }
        Returns: {
          tipo_item: string
          codigo: string
          descricao: string
          dimensao_base: number
          unidade_dimensao: string
          fator_conversao: number
          quebra_percentual: number
          quantidade_calculada: number
          quantidade_final: number
          unidade_venda: string
          preco_unitario: number
          valor_total: number
          categoria: string
          ordem: number
        }[]
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
      recalcular_composicao: {
        Args: { p_composicao_id: string }
        Returns: number
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
        | "impermeabilizacao"
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
        "impermeabilizacao",
      ],
      tipo_usuario_enum: ["administrador", "vendedor", "representante"],
    },
  },
} as const
