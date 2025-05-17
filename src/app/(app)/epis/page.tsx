
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, Archive, AlertCircle, CalendarClock, Edit2, MoreHorizontal, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data for EPI items
const mockEpis = [
  { id: 'EPI001', name: 'Capacete de Segurança', quantity: 50, validity: addMonths(new Date(), 6), location: 'Almoxarifado A', status: 'ok' },
  { id: 'EPI002', name: 'Luvas de Proteção (par)', quantity: 120, validity: addMonths(new Date(), 12), location: 'Oficina Mecânica', status: 'ok' },
  { id: 'EPI003', name: 'Óculos de Segurança', quantity: 5, validity: addMonths(new Date(), 1), location: 'Laboratório', status: 'baixo_estoque' },
  { id: 'EPI004', name: 'Máscara PFF2', quantity: 200, validity: addMonths(new Date(), 2), location: 'Almoxarifado B', status: 'proximo_validade' },
  { id: 'EPI005', name: 'Protetor Auricular', quantity: 75, validity: addMonths(new Date(), 24), location: 'Linha de Produção', status: 'ok' },
  { id: 'EPI006', name: 'Cinto de Segurança (altura)', quantity: 8, validity: new Date(), location: 'Estoque Emergência', status: 'expirado' },
];

interface EpiItem {
  id: string;
  name: string;
  quantity: number;
  validity: Date;
  location: string;
  status: 'ok' | 'baixo_estoque' | 'proximo_validade' | 'expirado';
}

const getValidityStatus = (validityDate: Date, quantity: number): EpiItem['status'] => {
  const today = new Date();
  const daysUntilExpiry = differenceInDays(validityDate, today);

  if (daysUntilExpiry < 0) return 'expirado';
  if (quantity < 10) return 'baixo_estoque'; // Threshold for low stock
  if (daysUntilExpiry <= 30) return 'proximo_validade'; // Nearing expiry if <= 30 days
  return 'ok';
};

const getStatusBadgeClass = (status: EpiItem['status']) => {
  switch (status) {
    case 'ok':
      return 'bg-green-500/20 text-green-700 border-green-500/30';
    case 'baixo_estoque':
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    case 'proximo_validade':
      return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
    case 'expirado':
      return 'bg-red-500/20 text-red-700 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
  }
};

const getStatusText = (status: EpiItem['status']) => {
  switch (status) {
    case 'ok': return 'OK';
    case 'baixo_estoque': return 'Baixo Estoque';
    case 'proximo_validade': return 'Próximo Validade';
    case 'expirado': return 'Expirado';
    default: return 'Desconhecido';
  }
}

export default function EpisPage() {
  const { toast } = useToast();
  const [epis, setEpis] = useState<EpiItem[]>(() => 
    mockEpis.map(epi => ({...epi, status: getValidityStatus(epi.validity, epi.quantity)}))
  );

  const totalItems = epis.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = epis.filter(item => item.status === 'baixo_estoque').length;
  const expiringSoonItems = epis.filter(item => item.status === 'proximo_validade' || item.status === 'expirado').length;

  const handleAddItem = () => {
    toast({
      title: 'Adicionar Novo EPI',
      description: 'Funcionalidade de modal para adicionar novo EPI será implementada aqui.',
    });
    // Placeholder: Logic to open a modal for adding a new EPI
  };

  const handleViewDetails = (epiId: string) => {
     toast({
      title: 'Ver Detalhes do EPI',
      description: `Funcionalidade para ver detalhes do EPI ${epiId} (com abas de Visão Geral, Histórico de Uso, Anexos) será implementada.`,
    });
  };
  
  const handleEditItem = (epiId: string) => {
     toast({
      title: 'Editar EPI',
      description: `Funcionalidade para editar EPI ${epiId} será implementada (provavelmente na tela de detalhes).`,
    });
  };


  return (
    <>
      <PageHeader
        title="Gerenciamento de EPIs"
        description="Monitore o inventário, validades e uso de Equipamentos de Proteção Individual."
        actions={
          <Button onClick={handleAddItem}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Item
          </Button>
        }
      />

      {/* Inventory Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard title="Total de Itens em Estoque" value={totalItems} iconName="Archive" iconColor="text-blue-500" />
        <StatCard title="Itens com Baixo Estoque" value={lowStockItems} iconName="AlertCircle" iconColor="text-yellow-500" subtitle={`${lowStockItems} tipo(s) abaixo do mínimo`} />
        <StatCard title="Itens Próximos da Validade / Expirados" value={expiringSoonItems} iconName="CalendarClock" iconColor="text-red-500" subtitle={`${expiringSoonItems} tipo(s) requerem atenção`} />
      </div>

      {/* List View */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Lista de EPIs</h2>
        {/* Placeholder for filters: status, location, type */}
      </div>
      
      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Item</TableHead>
              <TableHead className="text-center">Quantidade</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {epis.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell>{format(item.validity, 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={`text-xs ${getStatusBadgeClass(item.status)}`}>
                    {getStatusText(item.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(item.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Ver Detalhes</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditItem(item.id)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      {/* Placeholder for "Log Usage" especially for extinguishers */}
                      {item.name.toLowerCase().includes("extintor") && (
                        <DropdownMenuItem onClick={() => toast({title: "Registrar Uso de Extintor", description:"Funcionalidade para registrar uso e disparar manutenção."})}>
                            <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                            <span className="text-destructive">Registrar Uso</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" disabled>
          Anterior
        </Button>
        <Button variant="outline" size="sm">
          Próximo
        </Button>
      </div>
      {/* 
        Placeholder for Detail View (Tabs: Overview, Usage History, Attachments)
        This would likely be a separate page or a large modal.
        - Overview: Basic details, photo, specifications.
        - Usage History: Table of technician, date, quantity, signature.
        - Attachments: List of related documents (manuals, certificates).

        Extinguisher Tracking:
        - Specific logic for extinguishers. Logging usage could trigger a maintenance request (flow).
      */}
    </>
  );
}

    