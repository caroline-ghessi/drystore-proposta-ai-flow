
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlanilhaQuantitativos } from "@/components/wizard/PlanilhaQuantitativos";
import { usePropostas } from "@/hooks/usePropostas";
import { useQuantitativosShingle } from "@/hooks/useQuantitativosShingle";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ItemQuantitativo } from '@/components/wizard/PlanilhaQuantitativos';

interface ModalQuantitativosPropostasProps {
  isOpen: boolean;
  onClose: () => void;
  propostaId: string;
  clienteNome: string;
}

export function ModalQuantitativosPropostas({
  isOpen,
  onClose,
  propostaId,
  clienteNome
}: ModalQuantitativosPropostasProps) {
  const [itensQuantitativos, setItensQuantitativos] = useState<ItemQuantitativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areaTelhado, setAreaTelhado] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);

  const { buscarPropostaPorId } = usePropostas();
  const { processarQuantitativosProposta } = useQuantitativosShingle();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && propostaId) {
      carregarQuantitativos();
    }
  }, [isOpen, propostaId]);

  const carregarQuantitativos = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Buscando proposta:', propostaId);
      const proposta = await buscarPropostaPorId(propostaId);
      
      if (!proposta) {
        throw new Error('Proposta não encontrada');
      }

      // Verificar primeiro o formato novo (quantitativos_aprovados)
      if (!proposta.dados_extraidos?.quantitativos_aprovados && !proposta.dados_extraidos?.orcamento_completo?.itens) {
        throw new Error('Dados de quantitativos não encontrados na proposta');
      }

      console.log('Dados da proposta:', proposta.dados_extraidos);

      // Processar os dados extraídos para o formato da planilha
      const itensProcessados = processarQuantitativosProposta(proposta.dados_extraidos);
      
      setItensQuantitativos(itensProcessados);
      setAreaTelhado(proposta.dados_extraidos.area_telhado || 0);
      setValorTotal(proposta.valor_total || 0);

      console.log('Quantitativos processados:', itensProcessados);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar quantitativos';
      setError(errorMessage);
      console.error('Erro ao carregar quantitativos:', err);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = () => {
    toast({
      title: "Quantitativos Confirmados",
      description: "Os quantitativos foram validados com sucesso.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Planilha de Quantitativos - {clienteNome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando quantitativos...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && itensQuantitativos.length > 0 && (
            <PlanilhaQuantitativos
              itens={itensQuantitativos}
              area_telhado={areaTelhado}
              valor_total_geral={valorTotal}
              onBack={onClose}
              onApprove={handleAprovar}
            />
          )}

          {!loading && !error && itensQuantitativos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum quantitativo encontrado para esta proposta.</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
