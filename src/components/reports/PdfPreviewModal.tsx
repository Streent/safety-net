
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/common/logo'; // Assuming this is your Safety Solutions logo
import type { TechnicalReportOutput } from '@/ai/flows/generate-technical-report-flow';
import Image from 'next/image';
import { Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: TechnicalReportOutput | null;
  userPhotoDescriptions: string[];
}

export function PdfPreviewModal({
  isOpen,
  onClose,
  reportData,
  userPhotoDescriptions,
}: PdfPreviewModalProps) {
  const { toast } = useToast();

  if (!reportData) {
    return null;
  }

  const handleActualDownload = () => {
    // This would trigger actual PDF generation in a real app (e.g., via API call)
    toast({
      title: 'Download Simulado',
      description: 'A geração real do PDF seria iniciada aqui.',
    });
  };

  const combinedPhotoEvidence = [
    ...reportData.photographicEvidence,
    ...userPhotoDescriptions.map((desc, index) => ({
      photoNumber: `Usuário ${index + 1}`,
      description: desc,
    })),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle className="text-lg">Pré-visualização do Relatório (Simulação PDF)</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 bg-gray-100 dark:bg-gray-800 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-900 shadow-lg p-6 sm:p-8 md:p-10 min-h-full A4-aspect-ratio-simulation">
            {/* PDF Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
              <div className="w-1/4">
                <Logo className="h-10 w-auto text-black dark:text-white" /> {/* Adjust logo color if needed */}
              </div>
              <div className="w-1/2 text-center">
                <h1 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                  RELATÓRIO DE INSPEÇÃO DE SEGURANÇA DO TRABALHO
                </h1>
              </div>
              <div className="w-1/4 text-right">
                {/* Placeholder for PLANGEFF logo */}
                <span className="text-lg font-semibold text-red-600 dark:text-red-500">PLANGEFF</span>
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              {/* Report Specific Header Info from AI */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                <p><strong>Empresa:</strong> {reportData.header.company}</p>
                <p><strong>Local:</strong> {reportData.header.location}</p>
                <p><strong>Data do Evento:</strong> {reportData.header.eventDate}</p>
                {reportData.header.geolocation && (
                  <p><strong>Geolocalização:</strong> {reportData.header.geolocation}</p>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-2">2. Objetivo da Inspeção</h2>
              <p className="whitespace-pre-wrap">{reportData.objective}</p>

              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-2">3. Resumo Técnico</h2>
              <p className="whitespace-pre-wrap">{reportData.technicalSummary}</p>

              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-2">4. Achados Técnicos</h2>
              {reportData.findings.map((finding, index) => (
                <div key={index} className="ml-2 mb-3 p-2 border-l-2 border-gray-200 dark:border-gray-700">
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
              ))}

              {combinedPhotoEvidence.length > 0 && (
                <>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-2">5. Evidências Fotográficas</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {combinedPhotoEvidence.map((evidence, index) => (
                      <div key={index} className="border p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        <Image
                          src={`https://placehold.co/600x400.png?text=Foto+${index+1}`}
                          alt={evidence.description}
                          width={300}
                          height={200}
                          className="w-full h-auto object-cover rounded mb-1"
                          data-ai-hint="report evidence"
                        />
                        <p className="text-center text-xs italic">{evidence.photoNumber}: {evidence.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-2">6. Conclusão</h2>
              <p className="whitespace-pre-wrap">{reportData.conclusion}</p>

              <Separator className="my-4" />
              <p className="italic text-center text-xs">{reportData.closingStatement}</p>
            </div>

            {/* PDF Footer */}
            <div className="mt-auto pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              <Separator className="mb-2" />
              robson.perusso@safetysolutions.com.br
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t shrink-0 flex-wrap justify-center sm:justify-end">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto mb-2 sm:mb-0">
            Fechar Pré-visualização
          </Button>
          <Button onClick={handleActualDownload} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Download Real (Simulado)
          </Button>
           <Button variant="secondary" onClick={() => window.print()} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir (Navegador)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
