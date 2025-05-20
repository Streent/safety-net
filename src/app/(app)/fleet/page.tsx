
'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, PlusCircle, ListFilter, GanttChartSquare, Fuel, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Vehicle {
  id: string;
  imageUrl: string;
  model: string;
  plate: string;
  status: VehicleStatus;
  type: VehicleType;
  location: string; // Added location
  dataAiHint: string;
}

type VehicleStatus = 'Disponível' | 'Em Manutenção' | 'Em Uso';
type VehicleType = 'Utilitário Leve' | 'Caminhonete' | 'Carro de Passeio' | 'Van' | 'Motocicleta' | 'Caminhão Pesado' | 'Todos os Tipos';

const mockVehicles: Vehicle[] = [
  { id: '1', imageUrl: 'https://placehold.co/600x400.png', model: 'Fiat Strada', plate: 'BRA2E19', status: 'Disponível', type: 'Utilitário Leve', location: 'Garagem Sede', dataAiHint: 'pickup truck' },
  { id: '2', imageUrl: 'https://placehold.co/600x400.png', model: 'Toyota Hilux', plate: 'MER1C0S', status: 'Em Manutenção', type: 'Caminhonete', location: 'Oficina Parceira', dataAiHint: 'large truck' },
  { id: '3', imageUrl: 'https://placehold.co/600x400.png', model: 'VW Gol', plate: 'PAU1L0A', status: 'Em Uso', type: 'Carro de Passeio', location: 'Em Rota - Cliente X', dataAiHint: 'hatchback car' },
  { id: '4', imageUrl: 'https://placehold.co/600x400.png', model: 'Mercedes Sprinter', plate: 'VAN2024', status: 'Disponível', type: 'Van', location: 'Pátio B', dataAiHint: 'white van' },
  { id: '5', imageUrl: 'https://placehold.co/600x400.png', model: 'Honda CB 500', plate: 'MOT0B0Y', status: 'Disponível', type: 'Motocicleta', location: 'Garagem Sede', dataAiHint: 'motorcycle' },
  { id: '6', imageUrl: 'https://placehold.co/600x400.png', model: 'Scania R450', plate: 'TRC7K0R', status: 'Em Uso', type: 'Caminhão Pesado', location: 'Rodovia BR-116', dataAiHint: 'semi truck' },
];

const vehicleTypes: VehicleType[] = ['Todos os Tipos', 'Utilitário Leve', 'Caminhonete', 'Carro de Passeio', 'Van', 'Motocicleta', 'Caminhão Pesado'];
const vehicleStatuses: (VehicleStatus | 'Todos os Status')[] = ['Todos os Status', 'Disponível', 'Em Manutenção', 'Em Uso'];


const statusColors: Record<VehicleStatus, string> = {
  'Disponível': 'bg-green-500/20 text-green-700 border-green-500/30',
  'Em Manutenção': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  'Em Uso': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
};

interface VehicleCardProps {
  vehicle: Vehicle;
  animationDelay: string;
  isMounted: boolean;
  onViewDetails: (vehicleId: string) => void;
}

function VehicleCard({ vehicle, animationDelay, isMounted, onViewDetails }: VehicleCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-[1.02]",
        "opacity-0", // Start transparent for fade-in
        isMounted && "opacity-100" // Fade in when mounted
      )}
      style={{ transitionDelay: isMounted ? animationDelay : '0ms', transitionProperty: 'opacity, transform, box-shadow' }}
    >
      <CardHeader className="p-0">
        <Image
          src={vehicle.imageUrl}
          alt={`Imagem do ${vehicle.model}`}
          width={600}
          height={400}
          className="object-cover w-full h-40 md:h-48"
          data-ai-hint={vehicle.dataAiHint}
          priority={parseInt(vehicle.id) <= 3} // Prioritize loading for first few images
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl mb-1">{vehicle.model}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-1">
          Placa: {vehicle.plate} <span className="mx-1">|</span> Tipo: {vehicle.type}
        </CardDescription>
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          Última Localização: {vehicle.location}
        </div>
        <div className="flex justify-between items-center">
          <Badge variant="outline" className={`text-xs ${statusColors[vehicle.status as VehicleStatus]}`}>
            {vehicle.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => onViewDetails(vehicle.id)}>Ver Detalhes</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FleetPage() {
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'Todos os Tipos'>('Todos os Tipos');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'Todos os Status'>('Todos os Status');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mount after a short delay to allow CSS to apply initial opacity-0
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRequestVehicle = () => {
    toast({
      title: 'Solicitar Veículo',
      description: 'Funcionalidade de solicitação de veículo a ser implementada.',
    });
  };

  const handleViewDetails = (vehicleId: string) => {
    toast({
      title: 'Ver Detalhes do Veículo',
      description: `Modal com detalhes do veículo ${vehicleId} será implementado aqui.`,
    });
    // Later: Open VehicleDetailModal with vehicleId
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
      />

      <Card className="mb-6 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as VehicleType)}>
                <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrar por tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as VehicleStatus)}>
                <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrar por status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleRequestVehicle} className="w-full mt-2 sm:mt-0 sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Solicitar Veículo
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Veículos Disponíveis</h2>
        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle, index) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                animationDelay={`${index * 75}ms`}
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
          <TabsTrigger value="requests">
            <GanttChartSquare className="mr-2 h-4 w-4" />
            Solicitações
          </TabsTrigger>
          <TabsTrigger value="checklists">
            <ListFilter className="mr-2 h-4 w-4" />
            Checklists
          </TabsTrigger>
          <TabsTrigger value="fuel_logs">
            <Fuel className="mr-2 h-4 w-4" />
            Registros de Combustível
          </TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Veículos</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as solicitações de veículos. Formulário de solicitação com selecionadores de data/hora, campo de texto para finalidade e upload de foto a ser implementado aqui.
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
              <CardTitle>Checklists de Veículos</CardTitle>
              <CardDescription>
                Acesse e preencha checklists de veículos. Formulário de checklist com acordeão de várias etapas (luzes, pneus, freios...), barra de progresso e botão "Salvar e Continuar" a ser implementado aqui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lista de checklists e formulário de preenchimento serão implementados aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="fuel_logs">
          <Card>
            <CardHeader>
              <CardTitle>Registros de Combustível</CardTitle>
              <CardDescription>
                Gerencie os registros de abastecimento. Formulário para selecionar solicitação, registrar litros, tipo de combustível e foto do recibo a ser implementado aqui. Aba de histórico com linha do tempo de solicitações, checklists e registros de combustível também será implementada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lista de registros e formulário serão implementados aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

