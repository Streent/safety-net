
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
import Image from 'next/image'; // Placeholder, not used yet for Report type
import { Download, Printer, Edit2, CalendarDays, User, Tag, MapPin, ShieldAlert, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

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
                <h1 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 uppercase">
                  Relatório de Incidente / Observação
                </h1>
              </div>
              <div className="w-1/4 text-right">
                <span className="text-lg font-semibold text-red-600 dark:text-red-500">PLANGEFF</span>
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                <p className="flex items-center"><Info className="w-4 h-4 mr-2 text-primary" /><strong>ID do Relatório:</strong> {report.id}</p>
                <p className="flex items-center"><CalendarDays className="w-4 h-4 mr-2 text-primary" /><strong>Data:</strong> {format(new Date(report.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                <p className="flex items-center"><User className="w-4 h-4 mr-2 text-primary" /><strong>Técnico:</strong> {report.technician}</p>
                <p className="flex items-center"><Tag className="w-4 h-4 mr-2 text-primary" /><strong>Tipo:</strong> {report.type}</p>
                <p className="flex items-center md:col-span-2"><MapPin className="w-4 h-4 mr-2 text-primary" /><strong>Local:</strong> {report.location || 'Não informado'}</p>
                {report.geolocation && <p className="flex items-center md:col-span-2"><MapPin className="w-4 h-4 mr-2 text-primary" /><strong>Geolocalização:</strong> {report.geolocation}</p>}
                 <div className="flex items-center md:col-span-2">
                    <ShieldAlert className="w-4 h-4 mr-2 text-primary" /><strong>Status:</strong>&nbsp;
                    <Badge variant="outline" className={`text-xs ${statusColors[report.status]}`}>
                        {report.status}
                    </Badge>
                </div>
              </div>
              
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-2">Descrição do Evento/Observação</h2>
              <p className="whitespace-pre-wrap p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md min-h-[100px]">
                {report.description || 'Nenhuma descrição fornecida.'}
              </p>
              
              {/* Placeholder for potential future fields from Report type (e.g. inspection details, photos) */}
              {/* 
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-1 mb-2">Evidências Fotográficas (Exemplo)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2].map(i => (
                    <div key={i} className="border p-2 rounded-md bg-gray-50 dark:bg-gray-800/50">
                        <Image
                          src={`https://placehold.co/600x400.png?text=Foto+Exemplo+${i}`}
                          alt={`Foto Exemplo ${i}`}
                          width={300}
                          height={200}
                          className="w-full h-auto object-cover rounded mb-1"
                        />
                        <p className="text-center text-xs italic">Descrição da foto exemplo {i}</p>
                    </div>
                ))}
              </div>
              */}

              <Separator className="my-6" />
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

