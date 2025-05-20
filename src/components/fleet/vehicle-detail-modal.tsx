// src/components/fleet/vehicle-detail-modal.tsx
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
import type { Vehicle } from '@/app/(app)/fleet/page'; 
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Car, History, FileText, CalendarDays, MapPinIcon, Tag, ShieldCheck, PlusCircle, Construction } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // Importar useRouter

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<Vehicle['status'], string> = {
  'Disponível': 'bg-green-500/20 text-green-700 border-green-500/30',
  'Em Manutenção': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  'Em Uso': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
};

export function VehicleDetailModal({ vehicle, isOpen, onOpenChange }: VehicleDetailModalProps) {
  const { toast } = useToast();
  const router = useRouter(); // Inicializar useRouter

  if (!vehicle) {
    return null;
  }

  const handleRequestThisVehicle = () => {
    onOpenChange(false); // Fechar o modal
    router.push(`/fleet/request?vehicleId=${vehicle.id}&vehicleModel=${encodeURIComponent(vehicle.model)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[2%] data-[state=open]:slide-in-from-bottom-[2%]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl flex items-center">
            <Car className="mr-3 h-6 w-6 text-primary" />
            Detalhes: {vehicle.model}
          </DialogTitle>
          <DialogDescription>
            Informações completas, histórico e opções para o veículo selecionado.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] lg:max-h-[70vh]">
          <div className="p-6 space-y-6">
            <div className="relative w-full h-56 rounded-lg overflow-hidden shadow-md">
              <Image
                src={vehicle.imageUrl}
                alt={`Imagem do ${vehicle.model}`}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
                data-ai-hint={vehicle.dataAiHint}
              />
              <Badge variant="outline" className={`absolute top-2 right-2 text-xs ${statusColors[vehicle.status]}`}>
                  {vehicle.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="flex items-center">
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>Placa:</strong>&nbsp;{vehicle.plate}
              </div>
              <div className="flex items-center">
                 <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>Tipo:</strong>&nbsp;{vehicle.type}
              </div>
              <div className="flex items-center md:col-span-2">
                <MapPinIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <strong>Última Localização Conhecida:</strong>&nbsp;{vehicle.location}
              </div>
            </div>
            
            <Separator />

            <div>
              <h3 className="text-md font-semibold mb-3 flex items-center">
                <History className="mr-2 h-5 w-5 text-primary" />
                Histórico de Uso (Placeholder)
              </h3>
              <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                <p className="text-xs">
                  Uma lista ou linha do tempo do histórico de uso, checklists e manutenções aparecerá aqui.
                </p>
              </div>
            </div>

            <Separator />
             <div>
              <h3 className="text-md font-semibold mb-3 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Documentos e Checklists (Placeholder)
              </h3>
              <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                <p className="text-xs">
                  Links para documentos do veículo (CRLV, seguro) e checklists preenchidos.
                </p>
              </div>
            </div>

             <Separator />
             <div>
              <h3 className="text-md font-semibold mb-3 flex items-center">
                <Construction className="mr-2 h-5 w-5 text-primary" />
                Manutenções Agendadas (Placeholder)
              </h3>
              <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                <p className="text-xs">
                  Lista de próximas manutenções preventivas ou corretivas agendadas.
                </p>
              </div>
            </div>


          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 border-t flex flex-col sm:flex-row gap-2">
          <Button 
            variant="default" 
            onClick={handleRequestThisVehicle}
            className="w-full sm:w-auto"
            disabled={vehicle.status !== 'Disponível'}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Solicitar Este Veículo
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
