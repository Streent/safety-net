// src/app/(app)/fleet/page.tsx
'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, PlusCircle, ListFilter, GanttChartSquare, Fuel, MapPin, CalendarDays, Construction } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { VehicleDetailModal } from '@/components/fleet/vehicle-detail-modal';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation'; 


export interface Vehicle {
  id: string;
  imageUrl: string;
  model: string;
  plate: string;
  status: VehicleStatus;
  type: VehicleType;
  location: string;
  dataAiHint: string;
}

export type VehicleStatus = 'Disponível' | 'Em Manutenção' | 'Em Uso';
export type VehicleType = 'Utilitário Leve' | 'Caminhonete' | 'Carro de Passeio' | 'Van' | 'Motocicleta' | 'Caminhão Pesado';

const mockVehicles: Vehicle[] = [
  { id: 'V001', imageUrl: 'https://placehold.co/600x400.png', model: 'Fiat Strada', plate: 'BRA2E19', status: 'Disponível', type: 'Utilitário Leve', location: 'Garagem Sede', dataAiHint: 'pickup truck' },
  { id: 'V002', imageUrl: 'https://placehold.co/600x400.png', model: 'Toyota Hilux', plate: 'MER1C0S', status: 'Em Manutenção', type: 'Caminhonete', location: 'Oficina Parceira', dataAiHint: 'large truck' },
  { id: 'V003', imageUrl: 'https://placehold.co/600x400.png', model: 'VW Gol', plate: 'PAU1L0A', status: 'Em Uso', type: 'Carro de Passeio', location: 'Em Rota - Cliente X', dataAiHint: 'hatchback car' },
  { id: 'V004', imageUrl: 'https://placehold.co/600x400.png', model: 'Mercedes Sprinter', plate: 'VAN2024', status: 'Disponível', type: 'Van', location: 'Pátio B', dataAiHint: 'white van' },
  { id: 'V005', imageUrl: 'https://placehold.co/600x400.png', model: 'Honda CB 500', plate: 'MOT0B0Y', status: 'Disponível', type: 'Motocicleta', location: 'Garagem Sede', dataAiHint: 'motorcycle' },
  { id: 'V006', imageUrl: 'https://placehold.co/600x400.png', model: 'Scania R450', plate: 'TRC7K0R', status: 'Em Uso', type: 'Caminhão Pesado', location: 'Rodovia BR-116', dataAiHint: 'semi truck' },
];

const vehicleTypeOptions: VehicleType[] = ['Utilitário Leve', 'Caminhonete', 'Carro de Passeio', 'Van', 'Motocicleta', 'Caminhão Pesado'];
const vehicleStatusOptions: VehicleStatus[] = ['Disponível', 'Em Manutenção', 'Em Uso'];

const statusColors: Record<VehicleStatus, string> = {
  'Disponível': 'bg-green-500/20 text-green-700 border-green-500/30',
  'Em Manutenção': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  'Em Uso': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
};

interface VehicleCardProps {
  vehicle: Vehicle;
  animationDelay: string;
  isMounted: boolean;
  onViewDetails: (vehicle: Vehicle) => void;
}

function VehicleCard({ vehicle, animationDelay, isMounted, onViewDetails }: VehicleCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-[1.02]",
        "opacity-0", 
        isMounted && "opacity-100 animate-in fade-in-50 slide-in-from-bottom-2" 
      )}
      style={{ animationDelay: isMounted ? animationDelay : '0ms', transitionProperty: 'opacity, transform, box-shadow, animation' }}
    >
      <CardHeader className="p-0 relative">
        <Image
          src={vehicle.imageUrl}
          alt={`Imagem do ${vehicle.model}`}
          width={600}
          height={300} 
          className="object-cover w-full h-32 md:h-40" 
          data-ai-hint={vehicle.dataAiHint}
          priority={parseInt(vehicle.id.replace('V','')) <= 3} 
        />
         <Badge variant="outline" className={`absolute top-2 right-2 text-xs ${statusColors[vehicle.status as VehicleStatus]}`}>
            {vehicle.status}
          </Badge>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg md:text-xl mb-1 line-clamp-1">{vehicle.model}</CardTitle>
        <CardDescription className="text-xs md:text-sm text-muted-foreground mb-2">
          Placa: {vehicle.plate} <span className="mx-1">|</span> Tipo: {vehicle.type}
        </CardDescription>
        <div className="flex items-center text-xs md:text-sm text-muted-foreground mb-3">
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          {vehicle.location}
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={() => onViewDetails(vehicle)}>Ver Detalhes</Button>
      </CardContent>
    </Card>
  );
}

export default function FleetPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'Todos os Tipos'>('Todos os Tipos');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'Todos os Status'>('Todos os Status');
  const [isMounted, setIsMounted] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const filteredVehicles = useMemo(() => {
    return mockVehicles.filter(vehicle => {
      const typeMatch = typeFilter === 'Todos os Tipos' || vehicle.type === typeFilter;
      const statusMatch = statusFilter === 'Todos os Status' || vehicle.status === statusFilter;
      return typeMatch && statusMatch;
    });
  }, [typeFilter, statusFilter]);

  return (
    <>
      <PageHeader
        title="Gerenciamento de Frota"
        description="Monitore veículos, solicitações, checklists e registros de combustível."
        actions={
          <Link href="/fleet/request" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Solicitar Veículo
            </Button>
          </Link>
        }
      />

      <Card className="mb-6 shadow-sm">
        <CardHeader>
            <CardTitle className="text-lg flex items-center">
                <ListFilter className="mr-2 h-5 w-5 text-primary"/>
                Filtrar Frota
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-start">
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as VehicleType | 'Todos os Tipos')}>
                <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filtrar por tipo">
                  <SelectValue placeholder="Todos os Tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos os Tipos">Todos os Tipos</SelectItem>
                  {vehicleTypeOptions.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as VehicleStatus | 'Todos os Status')}>
                <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filtrar por status">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos os Status">Todos os Status</SelectItem>
                  {vehicleStatusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Veículos ({filteredVehicles.length})</h2>
        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle, index) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                animationDelay={`${index * 60}ms`}
                isMounted={isMounted}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-10">
                <Car className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum veículo encontrado</h3>
                <p className="text-sm mb-4">Ajuste os filtros ou verifique os veículos cadastrados.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="requests" className="mt-8">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4">
          <TabsTrigger value="requests" className="text-xs sm:text-sm">
            <GanttChartSquare className="mr-1.5 sm:mr-2 h-4 w-4" />
            Minhas Solicitações
          </TabsTrigger>
          <TabsTrigger value="checklists" className="text-xs sm:text-sm">
            <ListFilter className="mr-1.5 sm:mr-2 h-4 w-4" />
            Checklists Preenchidos
          </TabsTrigger>
          <TabsTrigger value="fuel_logs" className="text-xs sm:text-sm">
            <Fuel className="mr-1.5 sm:mr-2 h-4 w-4" />
            Registros de Combustível
          </TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Solicitações de Veículos</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as suas solicitações de veículos. Uma lista de solicitações com status, datas e opção para cancelar ou ver detalhes será implementada aqui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lista de solicitações e formulário serão implementados aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="checklists">
          <Card>
            <CardHeader>
              <CardTitle>Meus Checklists de Veículos</CardTitle>
              <CardDescription>
                Acesse e preencha checklists de veículos. Formulário de checklist com acordeão de várias etapas (luzes, pneus, freios...), barra de progresso e botão "Salvar e Continuar" a ser implementado aqui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lista de checklists preenchidos e formulário de preenchimento serão implementados aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="fuel_logs">
          <Card>
            <CardHeader>
              <CardTitle>Registros de Combustível</CardTitle>
              <CardDescription>
                Gerencie os registros de abastecimento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Uma lista/tabela com os registros de abastecimento será implementada aqui.</p>
              <Link href="/fleet/fuel" passHref>
                <Button variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Novo Registro
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <VehicleDetailModal 
        vehicle={selectedVehicle} 
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />
    </>
  );
}
