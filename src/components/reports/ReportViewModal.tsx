
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/common/logo';
import type { Report, ReportStatus } from '@/app/(app)/reports/page';
import Image from 'next/image';
import { Download, Printer, Edit2, CalendarDays, User, Tag, MapPin, ShieldAlert, Info, Camera, EyeSlash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ReportViewModalProps {
  report: Report | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEditRequest: (report: Report) => void;
}

const statusColors: Record<ReportStatus, string> = {
  Aberto: 'bg-red-500/20 text-red-700 border-red-500/30',
  'Em Progresso': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  Fechado: 'bg-green-500/20 text-green-700 border-green-500/30',
};

// Simulação de dados de fotos para o modal, já que o tipo Report não os possui ainda
const mockPhotoEvidence = [
  { id: 'photo1', url: 'https://images.unsplash.com/photo-1505322022379-7c3353ee6291?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxpbmR1c3RyaWFsJTIwYXJlYSUyMG5pZ2h0fGVufDB8fHx8MTc0ODk2MDcyNnww&ixlib=rb-4.1.0&q=80&w=1080', description: 'Vista geral da área de carga onde o quase acidente ocorreu. Notar a proximidade de equipamentos e pessoal.', dataAiHint: 'industrial area night' },
  { id: 'photo2', url: 'https://images.unsplash.com/photo-1516200034618-a7d7a3383ec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHx3ZXQlMjBmbG9vciUyMGNhdXRpb258ZW58MHx8fHwxNzQ4OTYwNzI2fDA&ixlib=rb-4.1.0&q=80&w=1080', description: 'Detalhe da escada escorregadia no Armazém B, causa do incidente RPT001.', dataAiHint: 'wet floor caution' },
  { id: 'photo3', url: 'https://images.unsplash.com/photo-1599493347474-7e864c18489e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzYWZldHklMjB2aW9sYXRpb258ZW58MHx8fHwxNzQ4OTYwNzI1fDA&ixlib=rb-4.1.0&q=80&w=1080', description: 'Colaborador utilizando equipamento de forma inadequada na linha de produção.', dataAiHint: 'safety violation' },
];


export function ReportViewModal({
  report,
  isOpen,
  onOpenChange,
  onEditRequest,
}: ReportViewModalProps) {
  const { toast } = useToast();

  if (!report) {
    return null;
  }

  const handleActualDownload = () => {
    toast({
      title: 'Download Simulado',
      description: `A geração real do PDF para o relatório ${report.id} seria iniciada aqui.`,
    });
  };

  const handleEditClick = () => {
    onEditRequest(report);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle className="text-lg">Visualização do Relatório: {report.id}</DialogTitle>
           <DialogDescription>Simulação de como o relatório seria exibido em formato PDF.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 bg-gray-100 dark:bg-gray-800 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-900 shadow-lg p-6 sm:p-8 md:p-10 min-h-full A4-aspect-ratio-simulation">
            {/* PDF Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
              <div className="w-1/4">
                <Logo className="h-10 w-auto text-black dark:text-white" />
              </div>
              <div className="w-1/2 text-center">
                <h1 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 uppercase">
                  Relatório de Incidente / Observação
                </h1>
              </div>
              <div className="w-1/4 text-right">
                <span className="text-sm sm:text-base md:text-lg font-semibold text-red-600 dark:text-red-500">PLANGEFF</span>
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <Card className="mb-4 bg-gray-50 dark:bg-gray-800/50">
                <CardContent className="p-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                    <p className="flex items-center col-span-1 md:col-span-2"><Info className="w-3.5 h-3.5 mr-1.5 text-primary flex-shrink-0" /><strong>ID do Relatório:</strong> {report.id}</p>
                    <p className="flex items-center"><CalendarDays className="w-3.5 h-3.5 mr-1.5 text-primary flex-shrink-0" /><strong>Data:</strong> {format(new Date(report.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    <p className="flex items-center"><User className="w-3.5 h-3.5 mr-1.5 text-primary flex-shrink-0" /><strong>Técnico:</strong> {report.technician}</p>
                    <p className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1.5 text-primary flex-shrink-0" /><strong>Tipo:</strong> {report.type}</p>
                    <div className="flex items-center">
                        <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-primary flex-shrink-0" /><strong>Status:</strong>&nbsp;
                        <Badge variant="outline" className={`text-xs py-0.5 px-1.5 ${statusColors[report.status]}`}>
                            {report.status}
                        </Badge>
                    </div>
                    <p className="flex items-center col-span-1 md:col-span-2"><MapPin className="w-3.5 h-3.5 mr-1.5 text-primary flex-shrink-0" /><strong>Local:</strong> {report.location || 'Não informado'}</p>
                    {report.geolocation && <p className="flex items-center col-span-1 md:col-span-2"><MapPin className="w-3.5 h-3.5 mr-1.5 text-primary flex-shrink-0" /><strong>Geolocalização:</strong> {report.geolocation}</p>}
                </CardContent>
              </Card>
              
              <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-1.5">1. Descrição do Evento/Observação</h2>
              <p className="whitespace-pre-wrap p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md min-h-[80px]">
                {report.description || 'Nenhuma descrição fornecida.'}
              </p>

              <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-1.5 mt-3">2. Achados Técnicos / Não Conformidades (Exemplo)</h2>
              <p className="whitespace-pre-wrap p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md min-h-[60px] italic text-gray-500 dark:text-gray-400">
                (Esta seção seria preenchida com detalhes estruturados se o relatório fosse uma inspeção formal ou tivesse essa informação. Ex: Item 2.1: Extintor vencido. Risco: Incêndio não combatido. Recomendação: Substituir extintor.)
              </p>

              <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-1.5 mt-3">3. Recomendações (Exemplo)</h2>
              <p className="whitespace-pre-wrap p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md min-h-[60px] italic text-gray-500 dark:text-gray-400">
                (Esta seção listaria as ações corretivas e preventivas sugeridas. Ex: Realizar treinamento de reciclagem sobre uso de EPIs para a equipe do Setor X.)
              </p>
              
              <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-1.5 mt-3">4. EVIDÊNCIAS FOTOGRÁFICAS</h2>
              {mockPhotoEvidence.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {mockPhotoEvidence.map((photo, index) => (
                      <Card key={photo.id} className="overflow-hidden shadow-sm">
                        <div className="relative w-full aspect-[4/3]">
                          <Image
                            src={photo.url}
                            alt={photo.description || `Evidência Fotográfica ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint={photo.dataAiHint}
                          />
                        </div>
                        <CardContent className="p-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <strong>Foto {index + 1}:</strong> {photo.description || 'N/A'}
                          </p>
                           <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5 italic">
                            Detalhes e observações adicionais sobre esta imagem seriam listados aqui.
                          </p>
                        </CardContent>
                      </Card>
                  ))}
                </div>
              ) : (
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center text-gray-500 dark:text-gray-400 italic">
                  <Camera className="mx-auto h-8 w-8 mb-1 text-gray-400 dark:text-gray-500" />
                  Nenhuma evidência fotográfica anexada a este relatório (simulado).
                </div>
              )}

              <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-1.5 mt-3">5. Conclusão (Exemplo)</h2>
              <p className="whitespace-pre-wrap p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md min-h-[60px] italic text-gray-500 dark:text-gray-400">
                (Resumo técnico das condições gerais e reforço das ações corretivas/preventivas. Ex: A inspeção revelou X não conformidades que necessitam de ação imediata para mitigar os riscos identificados. Recomenda-se o acompanhamento das ações propostas.)
              </p>

              <Separator className="my-4" />
              <p className="italic text-center text-xs">Relatório gerado pelo sistema SafetyNet.</p>
            </div>

            {/* PDF Footer */}
            <div className="mt-auto pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              <Separator className="mb-2" />
              robson.perusso@safetysolutions.com.br
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t shrink-0 flex-wrap justify-center sm:justify-end gap-2">
          <Button variant="secondary" onClick={handleEditClick} className="w-full sm:w-auto">
            <Edit2 className="mr-2 h-4 w-4" />
            Editar Relatório
          </Button>
          <Button onClick={handleActualDownload} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF (Simulado)
          </Button>
           <Button variant="outline" onClick={() => window.print()} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


    