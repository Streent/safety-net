
// src/components/certificates/CertificateViewModal.tsx
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
import type { Certificado } from '@/app/(app)/certificados/page';
import Image from 'next/image';
import { Download, Printer, CalendarDays, User, FileText, Award, BuildingIcon, Info, Clock, MapPin, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CertificateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: Certificado | null;
}

export function CertificateViewModal({
  isOpen,
  onClose,
  certificateData,
}: CertificateViewModalProps) {
  const { toast } = useToast();

  if (!certificateData) {
    return null;
  }

  const handleActualDownload = () => {
    toast({
      title: 'Download Simulado',
      description: `A geração real do PDF para o certificado ${certificateData.id} seria iniciada aqui.`,
    });
  };

  const handlePrint = () => {
    // Temporariamente desabilitar o print direto, pois o modal não é ideal para isso.
    // window.print(); 
    toast({
        title: 'Imprimir (Navegador)',
        description: 'Esta ação usaria a funcionalidade de impressão do navegador. Para um PDF otimizado, use a opção de Download.',
    });
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle className="text-lg">Visualização do Certificado (Simulação)</DialogTitle>
          <DialogDescription>
            ID: {certificateData.id} - Pré-visualização do certificado para {certificateData.alunoNome}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 bg-gray-100 dark:bg-slate-800 p-2 sm:p-4">
          <div className="certificate-preview bg-white dark:bg-slate-900 shadow-lg p-6 sm:p-8 md:p-10 min-h-full A4-aspect-ratio-simulation mx-auto">
            {/* Cabeçalho do Certificado */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-300 dark:border-slate-700 text-center sm:text-left">
              <div className="w-full sm:w-1/4 mb-4 sm:mb-0">
                <Logo className="h-12 w-auto text-black dark:text-white mx-auto sm:mx-0" />
              </div>
              <div className="w-full sm:w-1/2 text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 uppercase">
                  CERTIFICADO DE CONCLUSÃO
                </h1>
              </div>
              <div className="w-full sm:w-1/4 text-center sm:text-right mt-4 sm:mt-0">
                <Image src="https://placehold.co/100x50.png?text=Empresa+Logo" alt="Logo Empresa Cliente" width={100} height={50} className="inline-block" data-ai-hint="company logo" />
              </div>
            </div>

            {/* Corpo do Certificado */}
            <div className="space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <p className="text-center leading-relaxed">
                Certificamos que <strong className="text-lg text-primary">{certificateData.alunoNome}</strong>,
                portador(a) do CPF nº <strong className="text-primary">{certificateData.alunoCPF}</strong>,
                concluiu com aproveitamento o treinamento de:
              </p>

              <h2 className="text-center text-lg sm:text-xl font-semibold text-primary my-4 py-2 border-y border-primary/30">
                {certificateData.cursoNome}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm p-3 border rounded-md bg-slate-50 dark:bg-slate-800/50">
                <p className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground flex-shrink-0" /><strong>Carga Horária:</strong> {certificateData.cargaHoraria} horas</p>
                <p className="flex items-center"><CalendarDays className="w-3.5 h-3.5 mr-1.5 text-muted-foreground flex-shrink-0" /><strong>Data de Realização:</strong> {format(new Date(certificateData.dataRealizacao), "dd/MM/yyyy", { locale: ptBR })}</p>
                <p className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-muted-foreground flex-shrink-0" /><strong>Local:</strong> {certificateData.localRealizacao}</p>
                <p className="flex items-center"><User className="w-3.5 h-3.5 mr-1.5 text-muted-foreground flex-shrink-0" /><strong>Instrutor:</strong> {certificateData.instrutorResponsavel}</p>
                {certificateData.dataValidade && (
                  <p className="flex items-center"><CalendarDays className="w-3.5 h-3.5 mr-1.5 text-muted-foreground flex-shrink-0" /><strong>Validade:</strong> {format(new Date(certificateData.dataValidade), "dd/MM/yyyy", { locale: ptBR })}</p>
                )}
                 {certificateData.nomeEmpresa && certificateData.nomeEmpresa !== 'N/A' && (
                  <p className="flex items-center md:col-span-2"><BuildingIcon className="w-3.5 h-3.5 mr-1.5 text-muted-foreground flex-shrink-0" /><strong>Empresa:</strong> {certificateData.nomeEmpresa} {certificateData.cnpjEmpresa && `(${certificateData.cnpjEmpresa})`}</p>
                )}
              </div>

              {certificateData.conteudoProgramatico && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">Conteúdo Programático (Resumido):</h3>
                  <ScrollArea className="h-24 max-h-24 p-2 border rounded-md bg-slate-50 dark:bg-slate-800/50 text-xs">
                    <p className="whitespace-pre-wrap">{certificateData.conteudoProgramatico}</p>
                  </ScrollArea>
                </div>
              )}

              {certificateData.observacoesAdicionais && (
                <div className="mt-3">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">Observações Adicionais:</h3>
                  <p className="text-xs p-2 border rounded-md bg-slate-50 dark:bg-slate-800/50 whitespace-pre-wrap">{certificateData.observacoesAdicionais}</p>
                </div>
              )}
            </div>

            {/* Rodapé do Certificado */}
            <div className="mt-8 pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="border-t border-gray-400 dark:border-slate-600 pt-1">
                  <p>{certificateData.instrutorResponsavel}</p>
                  <p className="text-[10px]">Instrutor Responsável</p>
                </div>
                <div className="border-t border-gray-400 dark:border-slate-600 pt-1">
                  <p>SafetyNet Solutions</p>
                   <p className="text-[10px]">Empresa Organizadora</p>
                </div>
              </div>
               <Separator className="my-3"/>
              <p className="text-[10px]">Este certificado foi gerado eletronicamente pelo sistema SafetyNet. ID: {certificateData.id}</p>
              <p className="text-[10px]">Para verificar a autenticidade, acesse: (link de verificação - placeholder)</p>
              {/* Placeholder para QR Code */}
              <div className="mt-2">
                <Image src="https://placehold.co/80x80.png?text=QR+Code" alt="QR Code de Validação" width={60} height={60} className="inline-block" data-ai-hint="qr code" />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t shrink-0 flex-wrap justify-center sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto mb-2 sm:mb-0">
            Fechar
          </Button>
          <Button onClick={handleActualDownload} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Download PDF (Simulado)
          </Button>
           <Button variant="secondary" onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Estilo para simular A4 (opcional, pode ser ajustado)
const a4Style = `
  @media print {
    .certificate-preview {
      box-shadow: none !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 auto !important;
      background-color: white !important;
      width: 210mm;
      height: 297mm;
      page-break-after: always;
    }
    .no-print { display: none !important; }
  }
  .A4-aspect-ratio-simulation {
    width: 100%;
    /* aspect-ratio: 210 / 297; */ /* A4 aspect ratio */
    /* max-width: 794px; */ /* Roughly 210mm at 96dpi */
    /* max-height: 1123px; */ /* Roughly 297mm at 96dpi */
  }
`;

// Adicionar estilo globalmente (se não estiver já feito para print)
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = a4Style;
  document.head.appendChild(styleSheet);
}

