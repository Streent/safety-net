
// src/components/epis/EpiDetailDrawer.tsx
'use client';

import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Epi } from '@/app/(app)/epis/page';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Archive,
  CalendarClock,
  MapPin,
  Tag,
  ListChecks,
  Paperclip,
  ShieldQuestion,
  Info,
  Layers,
  UserCog,
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle as UiCardTitle } from "@/components/ui/card";

interface EpiDetailDrawerProps {
  epi: Epi | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  getValidityStatus: (
    validityDateInput: Date | string,
    quantity: number,
    minimumStock?: number
  ) => { status: string; daysRemaining: number | null; isLowStock: boolean };
  getStatusBadgeClass: (status: string) => string;
  getStatusText: (status: string) => string;
}

export function EpiDetailDrawer({
  epi,
  isOpen,
  onOpenChange,
  getValidityStatus,
  getStatusBadgeClass,
  getStatusText,
}: EpiDetailDrawerProps) {
  const isMobile = useIsMobile();

  if (!epi) {
    return null;
  }

  const { status: epiCurrentStatus } = getValidityStatus(
    epi.validity,
    epi.quantity,
    epi.minimumStock
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          "flex flex-col p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          isMobile ? "h-[90vh] rounded-t-lg data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom" 
                   : "w-full sm:max-w-md lg:max-w-lg data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
        )}
      >
        <SheetHeader className="p-4 sm:p-6 border-b">
          <SheetTitle className="text-xl sm:text-2xl flex items-center">
            <Tag className="mr-3 h-6 w-6 text-primary" />
            Detalhes do EPI: {epi.name}
          </SheetTitle>
          <SheetDescription>
            Informações completas, histórico e anexos do item.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="overview">
                  <Info className="mr-1.5 h-4 w-4" /> Visão Geral
                </TabsTrigger>
                <TabsTrigger value="history">
                  <ListChecks className="mr-1.5 h-4 w-4" /> Histórico
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  <Paperclip className="mr-1.5 h-4 w-4" /> Anexos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0 space-y-4">
                <Card className="shadow-md">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-lg font-medium">Informações Principais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-sm">
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className={`text-xs mr-2 ${getStatusBadgeClass(epiCurrentStatus)}`}
                      >
                        {getStatusText(epiCurrentStatus)}
                      </Badge>
                    </div>
                    <p className="font-semibold text-base">{epi.name}</p>
                     <p className="flex items-center">
                      <Layers className="inline h-4 w-4 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <strong>CA:</strong>&nbsp;{epi.caNumber || 'N/A'}
                    </p>
                    <p className="flex items-center">
                      <Archive className="inline h-4 w-4 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <strong>Qtde. Estoque:</strong>&nbsp;{epi.quantity}
                    </p>
                    <p className="flex items-center">
                      <CalendarClock className="inline h-4 w-4 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <strong>Validade:</strong>&nbsp;
                      {isValid(new Date(epi.validity))
                        ? format(new Date(epi.validity), 'dd/MM/yyyy', { locale: ptBR })
                        : 'N/A'}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="inline h-4 w-4 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <strong>Localização:</strong>&nbsp;{epi.location}
                    </p>
                    <p className="flex items-center">
                      <ShieldQuestion className="inline h-4 w-4 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <strong>Categoria:</strong>&nbsp;{epi.category || 'Não especificada'}
                    </p>
                     <p className="flex items-center">
                      <UserCog className="inline h-4 w-4 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <strong>Responsável:</strong>&nbsp;{epi.responsible || 'N/A'}
                    </p>
                    <p className="flex items-center">
                      <Archive className="inline h-4 w-4 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <strong>Estoque Mínimo:</strong>&nbsp;{epi.minimumStock ?? 'Não definido'}
                    </p>
                  </CardContent>
                </Card>
                
                {epi.photoUrls && epi.photoUrls.length > 0 && (
                  <Card className="shadow-md">
                     <CardHeader className="pb-3 pt-4">
                        <CardTitle className="text-lg font-medium">Fotos do Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {epi.photoUrls.map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                            <Image
                              src={url}
                              alt={`Foto ${index + 1} de ${epi.name}`}
                              layout="fill"
                              objectFit="cover"
                              data-ai-hint="EPI photo"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <Card className="shadow-md">
                   <CardHeader className="pb-3 pt-4">
                        <CardTitle className="text-lg font-medium">Histórico de Uso e Distribuição</CardTitle>
                    </CardHeader>
                  <CardContent>
                    <div className="p-6 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                      <ListChecks className="mx-auto h-10 w-10 mb-2" />
                      <p className="text-sm">
                        A lista de entregas, devoluções e uso do EPI será exibida aqui (data, colaborador, quantidade, assinatura).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attachments" className="mt-0">
                <Card className="shadow-md">
                   <CardHeader className="pb-3 pt-4">
                        <CardTitle className="text-lg font-medium">Anexos e Documentos do EPI</CardTitle>
                    </CardHeader>
                  <CardContent>
                     <div className="p-6 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                      <Paperclip className="mx-auto h-10 w-10 mb-2" />
                      <p className="text-sm">
                        Certificados, manuais ou outros documentos vinculados a este EPI serão listados aqui.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 sm:p-6 border-t">
          <SheetClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Fechar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
