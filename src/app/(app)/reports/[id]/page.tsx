
'use client';
import { PageHeader } from '@/components/common/page-header';
import { IncidentForm, type IncidentFormValues } from '@/components/reports/incident-form';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download, Bot, ListChecks, Loader2, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Report } from '@/app/(app)/reports/page'; // Assuming Report type is exported
import { summarizeIncidentReport, type SummarizeIncidentReportInput, type SummarizeIncidentReportOutput } from '@/ai/flows/incident-report-summarization';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock data - em uma aplicação real, isso viria do backend
const mockReportDataStore: { [key: string]: Report } = {
  'RPT001': { id: 'RPT001', date: new Date(2024, 5, 10), technician: 'Alice Silva', type: 'Quase Acidente', status: 'Aberto', description: 'Escada escorregadia no armazém B. Foi observado que a escada estava molhada devido a um vazamento no teto não reportado anteriormente. Ninguém se machucou, mas o risco era iminente.', location: 'Armazém B', geolocation: '-23.5505, -46.6333' },
  'RPT002': { id: 'RPT002', date: new Date(2024, 5, 12), technician: 'Roberto Costa', type: 'Observação de Segurança', status: 'Fechado', description: 'Equipamento de proteção individual (EPI) não utilizado corretamente na linha de montagem 3. O colaborador em questão foi orientado.', location: 'Linha de Montagem 3' },
  'RPT003': { id: 'RPT003', date: new Date(2024, 5, 15), technician: 'Alice Silva', type: 'Primeiros Socorros', status: 'Em Progresso', description: 'Corte leve no dedo do colaborador Mário Santos ao manusear ferramenta sem luva apropriada. Foi feito curativo no local.', location: 'Oficina Mecânica' },
};


export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const reportId = params.id as string;

  const [reportData, setReportData] = useState<IncidentFormValues | undefined>(undefined);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  

  useEffect(() => {
    setIsLoadingReport(true);
    // Simular carregamento de dados
    setTimeout(() => {
      const fetchedReport = mockReportDataStore[reportId];
      if (fetchedReport) {
        setReportData({
          incidentType: fetchedReport.type,
          description: fetchedReport.description || '',
          location: fetchedReport.location || '',
          geolocation: fetchedReport.geolocation || '',
          date: fetchedReport.date ? new Date(fetchedReport.date) : new Date(),
          // media: undefined, // Mídia seria carregada separadamente
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao Carregar Relatório',
          description: `Relatório com ID ${reportId} não encontrado.`,
        });
        router.push('/reports'); // Redireciona se o relatório não for encontrado
      }
      setIsLoadingReport(false);
    }, 1000);
  }, [reportId, toast, router]);

  const handleUpdateReport = useCallback((data: IncidentFormValues) => {
    console.log('Updating report:', reportId, data);
    // Em uma aplicação real, aqui seria a chamada para a API para atualizar o relatório
    toast({
      title: 'Relatório Atualizado (Simulado)',
      description: `O relatório #${reportId} foi atualizado com sucesso.`,
    });
    // Potencialmente recarregar os dados ou atualizar o estado local
    setReportData(data); // Atualiza o estado local para refletir as mudanças no formulário
  }, [reportId, toast]);

  const handleExportPDF = () => {
    toast({
      title: 'Exportar PDF (Placeholder)',
      description: `Funcionalidade para exportar o relatório #${reportId} como PDF será implementada.`,
    });
  };

  const handleGenerateActionPlan = () => {
     toast({
      title: 'Gerar Plano de Ação (Placeholder)',
      description: `Funcionalidade para gerar um plano de ação para o relatório #${reportId} será implementada.`,
    });
  };

  const handleSummarizeWithAI = async () => {
    if (!reportData || !reportData.description) {
      toast({
        variant: 'destructive',
        title: 'Dados Insuficientes',
        description: 'A descrição do relatório é necessária para a sumarização.',
      });
      return;
    }
    setIsSummarizing(true);
    setSummary(null);
    setSummaryError(null);
    try {
      const input: SummarizeIncidentReportInput = { reportText: reportData.description };
      const result: SummarizeIncidentReportOutput = await summarizeIncidentReport(input);
      setSummary(result.summary);
      toast({
        title: 'Sumarização Concluída!',
        description: 'O relatório foi sumarizado pela IA.',
      });
    } catch (error) {
      console.error("AI Summarization failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao sumarizar.';
      setSummaryError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Falha na Sumarização',
        description: errorMessage,
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  if (isLoadingReport) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Carregando relatório...</p>
      </div>
    );
  }

  if (!reportData) {
    // Fallback caso o relatório não seja encontrado (já tratado com redirect, mas bom ter)
    return (
        <div className="text-center py-10">
            <p className="text-xl text-destructive">Relatório não encontrado.</p>
            <Button onClick={() => router.push('/reports')} className="mt-4">
                Voltar para Lista de Relatórios
            </Button>
        </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Editar Relatório #${reportId}`}
        description="Atualize os detalhes deste relatório de incidente."
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handleGenerateActionPlan}>
              <ListChecks className="mr-2 h-4 w-4" />
              Gerar Plano de Ação
            </Button>
          </div>
        }
      />
      
      <div className="mb-6">
        <IncidentForm initialData={reportData} onSubmitSuccess={handleUpdateReport} isModalMode={false} />
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            Assistente IA: Sumarização
          </CardTitle>
          <CardDescription>
            Utilize a IA para gerar um resumo conciso do relatório.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary && !summaryError && (
            <Alert variant="default" className="bg-blue-500/10 border-blue-500/30">
              <Bot className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-700 font-semibold">Resumo Gerado pela IA</AlertTitle>
              <AlertDescription className="text-blue-700/90 whitespace-pre-wrap text-sm leading-relaxed">
                {summary}
              </AlertDescription>
            </Alert>
          )}
          {summaryError && (
             <Alert variant="destructive">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Erro na Sumarização</AlertTitle>
              <AlertDescription>{summaryError}</AlertDescription>
            </Alert>
          )}
          {!summary && !summaryError && !isSummarizing && (
            <p className="text-sm text-muted-foreground italic">
              Clique no botão abaixo para gerar um resumo do campo "Descrição" do relatório.
            </p>
          )}
          {isSummarizing && (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando resumo...
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSummarizeWithAI} disabled={isSummarizing || !reportData?.description}>
            {isSummarizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sumarizando...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Sumarizar com IA
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

    