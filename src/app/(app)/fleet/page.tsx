
'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, PlusCircle, ListFilter, GanttChartSquare, Fuel } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

import { useState } from 'react';

// Mock data for vehicles
const mockVehicles = [
  { id: '1', imageUrl: 'https://placehold.co/600x400.png', model: 'Fiat Strada', plate: 'BRA2E19', status: 'Disponível', type: 'Utilitário Leve', dataAiHint: 'pickup truck' },
  { id: '2', imageUrl: 'https://placehold.co/600x400.png', model: 'Toyota Hilux', plate: 'MER1C0S', status: 'Em Manutenção', type: 'Caminhonete', dataAiHint: 'large truck' },
  { id: '3', imageUrl: 'https://placehold.co/600x400.png', model: 'VW Gol', plate: 'PAU1L0A', status: 'Em Uso', type: 'Carro de Passeio', dataAiHint: 'hatchback car' },
  { id: '4', imageUrl: 'https://placehold.co/600x400.png', model: 'Mercedes Sprinter', plate: 'VAN2024', status: 'Disponível', type: 'Van', dataAiHint: 'white van' },
  { id: '5', imageUrl: 'https://placehold.co/600x400.png', model: 'Honda CB 500', plate: 'MOT0B0Y', status: 'Disponível', type: 'Motocicleta', dataAiHint: 'motorcycle' },
  { id: '6', imageUrl: 'https://placehold.co/600x400.png', model: 'Scania R450', plate: 'TRC7K0R', status: 'Em Uso', type: 'Caminhão Pesado', dataAiHint: 'semi truck' },
];

type VehicleStatus = 'Disponível' | 'Em Manutenção' | 'Em Uso';

const statusColors: Record<VehicleStatus, string> = {
  'Disponível': 'bg-green-500/20 text-green-700 border-green-500/30',
  'Em Manutenção': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  'Em Uso': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
};

interface VehicleCardProps {
  vehicle: typeof mockVehicles[0];
}

function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-[1.02]">
      <CardHeader className="p-0">
        <Image
          src={vehicle.imageUrl}
          alt={`Imagem do ${vehicle.model}`}
          width={600}
          height={400}
          className="object-cover w-full h-40 md:h-48" // Reduced height for mobile
          data-ai-hint={vehicle.dataAiHint}
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl mb-1">{vehicle.model}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-3">
          Placa: {vehicle.plate} <span className="mx-1">|</span> Tipo: {vehicle.type}
        </CardDescription>
        <div className="flex justify-between items-center">
          <Badge variant="outline" className={`text-xs ${statusColors[vehicle.status as VehicleStatus]}`}>
            {vehicle.status}
          </Badge>
          <Button variant="outline" size="sm">Ver Detalhes</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FleetPage() {
  const { toast } = useToast();

  const handleRequestVehicle = () => {
    // Placeholder for opening a vehicle request form/modal
    toast({
      title: 'Solicitar Veículo',
      description: 'Funcionalidade de solicitação de veículo a ser implementada.',
    });
  };

  return (
    <>
      <PageHeader
        title="Gestão de Frota"
        description="Monitore solicitações de veículos, checklists e registros de combustível."
      />

      <Card className="mb-6 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrar por tipo">
                  <SelectValue placeholder="Filtrar por Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="utilitario">Utilitário Leve</SelectItem>
                  <SelectItem value="caminhonete">Caminhonete</SelectItem>
                  <SelectItem value="carro_passeio">Carro de Passeio</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="motocicleta">Motocicleta</SelectItem>
                  <SelectItem value="caminhao_pesado">Caminhão Pesado</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrar por status">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  <SelectItem value="em_uso">Em Uso</SelectItem>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
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
