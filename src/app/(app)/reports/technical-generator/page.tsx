
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { generateTechnicalReport, type TechnicalReportOutput, type GenerateTechnicalReportInput } from '@/ai/flows/generate-technical-report-flow';
import { Bot, Brain, AlertTriangleIcon, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { PdfPreviewModal } from '@/components/reports/PdfPreviewModal'; // Import the new modal

export default function TechnicalReportGeneratorPage() {
  const [userDescription, setUserDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [photoDescriptions, setPhotoDescriptions] = useState(''); // Keep as single string for textarea
  const [reportOutput, setReportOutput] = useState<TechnicalReportOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);

  const handleGenerateReport = async () => {
    if (!userDescription.trim()) {
      toast({
        variant: 'destructive',
        title: 'Descrição Necessária',
        description: 'Por favor, insira a descrição do evento/inspeção.',
      });
      return;
    }
    setIsGenerating(true);
    setError(null);
    setReportOutput(null);

    const photoDescriptionsArray = photoDescriptions.split('\n').filter(desc => desc.trim() !== '');

    const input: GenerateTechnicalReportInput = {
      userDescription,
      ...(companyName.trim() && { companyName: companyName.trim() }),
      ...(photoDescriptionsArray.length > 0 && { photoDescriptions: photoDescriptionsArray }),
    };

    try {
      const result = await generateTechnicalReport(input);
      setReportOutput(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Falha ao Gerar Relatório',
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Gerador de Relatório Técnico com IA"
        description="Forneça os detalhes e a IA estruturará um relatório técnico para você."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-6 w-6 text-primary" />
              Informações para a IA
            </CardTitle>
            <CardDescription>
              Descreva o evento ou inspeção e adicione detalhes opcionais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="userDescription" className="block text-sm font-medium text-muted-foreground mb-1">
                Descrição do Evento/Inspeção*
              </label>
              <Textarea
                id="userDescription"
                placeholder="Ex: Durante a vistoria no armazém seção B, foi identificado colaborador sem capacete..."
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                rows={8}
                className="text-base"
                data-ai-hint="descrição detalhada do evento ou inspeção"
              />
            </div>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-muted-foreground mb-1">
                Nome da Empresa (Opcional)
              </label>
              <Input
                id="companyName"
                placeholder="Nome da empresa inspecionada ou principal"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                data-ai-hint="nome da empresa"
              />
            </div>
            <div>
              <label htmlFor="photoDescriptions" className="block text-sm font-medium text-muted-foreground mb-1">
                Descrições das Fotos (Opcional, uma por linha)
              </label>
              <Textarea
                id="photoDescriptions"
                placeholder="Ex: Foto da escada escorregadia.\nFoto do extintor vencido."
                value={photoDescriptions}
                onChange={(e) => setPhotoDescriptions(e.target.value)}
                rows={4}
                data-ai-hint="descrições de fotos relevantes"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || !userDescription.trim()}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Bot className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Gerar Relatório com IA
                </>
              )}
            </Button>
            {reportOutput && !isGenerating && (
                <Button
                    variant="outline"
                    onClick={() => setIsPdfPreviewOpen(true)}
                    className="w-full sm:w-auto"
                >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF (Simulado)
                </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="shadow-lg lg:max-h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-6 w-6 text-primary" />
              Relatório Técnico Gerado
            </CardTitle>
            <CardDescription>
              Revise o relatório gerado pela IA. Edições podem ser necessárias.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4 pr-2">
            {isGenerating && (
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {reportOutput && !isGenerating && (
              <div className="space-y-3 text-sm">
                {/* Cabeçalho */}
                <div className="p-3 border rounded-md bg-muted/50">
                  <h3 className="font-semibold text-primary mb-1">1. Cabeçalho</h3>
                  <p><strong>Empresa:</strong> {reportOutput.header.company}</p>
                  <p><strong>Título:</strong> {reportOutput.header.title}</p>
                  <p><strong>Local:</strong> {reportOutput.header.location}</p>
                  <p><strong>Data do Evento:</strong> {reportOutput.header.eventDate}</p>
                  {reportOutput.header.geolocation && <p><strong>Geolocalização:</strong> {reportOutput.header.geolocation}</p>}
                </div>

                <Separator />
                <div>
                  <h3 className="font-semibold text-primary mb-1">2. Objetivo da Inspeção</h3>
                  <p className="whitespace-pre-wrap pl-2">{reportOutput.objective}</p>
                </div>

                <Separator />
                <div>
                  <h3 className="font-semibold text-primary mb-1">3. Resumo Técnico</h3>
                  <p className="whitespace-pre-wrap pl-2">{reportOutput.technicalSummary}</p>
                </div>

                <Separator />
                <div>
                  <h3 className="font-semibold text-primary mb-1">4. Achados Técnicos</h3>
                  {reportOutput.findings.length > 0 ? (
                    reportOutput.findings.map((finding, index) => (
                      <div key={index} className="ml-2 mb-2 p-2 border-l-2 border-primary/30">
                        <p><strong>{finding.itemNumber}:</strong> {finding.description}</p>
                        <ul className="list-disc list-inside ml-4 text-xs">
                          <li><strong>Risco Identificado:</strong> {finding.identifiedRisk}</li>
                          <li><strong>Área Afetada:</strong> {finding.affectedArea}</li>
                          <li><strong>Recomendação Técnica:</strong> {finding.technicalRecommendation}</li>
                          {finding.suggestedResponsible && 
                            <li><strong>Responsável Sugerido:</strong> {finding.suggestedResponsible}</li>
                          }
                        </ul>
                      </div>
                    ))
                  ) : <p className="pl-2 italic text-muted-foreground">Nenhum achado específico detalhado pela IA.</p>}
                </div>

                <Separator />
                <div>
                  <h3 className="font-semibold text-primary mb-1">5. Evidências Fotográficas (Descrições)</h3>
                  {reportOutput.photographicEvidence.length > 0 ? (
                    <ul className="list-decimal list-inside pl-2 space-y-1">
                      {reportOutput.photographicEvidence.map((evidence, index) => (
                        <li key={index}><strong>{evidence.photoNumber}:</strong> {evidence.description}</li>
                      ))}
                    </ul>
                  ) : <p className="pl-2 italic text-muted-foreground">Nenhuma descrição de evidência fotográfica gerada pela IA.</p>}
                </div>
                
                <Separator />
                <div>
                  <h3 className="font-semibold text-primary mb-1">6. Conclusão</h3>
                  <p className="whitespace-pre-wrap pl-2">{reportOutput.conclusion}</p>
                </div>
                
                <Separator />
                <p className="italic text-center text-xs pt-2">{reportOutput.closingStatement}</p>
              </div>
            )}
            {!reportOutput && !isGenerating && !error && (
              <div className="text-center text-muted-foreground py-10">
                <FileText className="mx-auto h-12 w-12 mb-3" />
                <p>O relatório gerado aparecerá aqui.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <PdfPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        reportData={reportOutput}
        userPhotoDescriptions={photoDescriptions.split('\n').filter(desc => desc.trim() !== '')}
      />
    </>
  );
}
