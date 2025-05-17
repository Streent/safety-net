
'use client';

import { useState, useEffect } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, Archive, AlertCircle, CalendarClock, Edit2, MoreHorizontal, Eye, Loader2, Check, Calendar as CalendarIconLucide } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths, differenceInDays, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

interface Epi {
  id: string;
  name: string;
  quantity: number;
  validity: Date;
  location: string;
  category?: string; // Ex: Proteção Respiratória, Proteção Auditiva
  caNumber?: string; // Certificado de Aprovação
}

type EpiStatus = 'OK' | 'Baixo Estoque' | 'Próximo Validade' | 'Expirado' | 'Crítico';

const mockEpis: Epi[] = [
  { id: 'EPI001', name: 'Máscara N95', quantity: 50, validity: addMonths(new Date(), 3), location: 'Almoxarifado A', caNumber: '12345' },
  { id: 'EPI002', name: 'Capacete de Segurança', quantity: 5, validity: addMonths(new Date(), 12), location: 'Estante B1', category: 'Proteção da Cabeça' },
  { id: 'EPI003', name: 'Luvas de Proteção (par)', quantity: 20, validity: addMonths(new Date(), -1), location: 'Almoxarifado A' },
  { id: 'EPI004', name: 'Protetor Auricular', quantity: 30, validity: addMonths(new Date(), 1), location: 'Estante C3', caNumber: '67890' },
  { id: 'EPI005', name: 'Óculos de Segurança', quantity: 15, validity: addMonths(new Date(), 6), location: 'Almoxarifado B' },
  { id: 'EPI006', name: 'Extintor ABC (2kg)', quantity: 2, validity: addMonths(new Date(), 0), location: 'Corredor Principal', category: 'Combate a Incêndio' },
  { id: 'EPI007', name: 'Cinto de Segurança para Altura', quantity: 8, validity: addMonths(new Date(), 24), location: 'Sala de Equipamentos', caNumber: '11223' },
];

const epiFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome do item deve ter pelo menos 3 caracteres.' }),
  quantity: z.coerce.number().min(1, { message: 'A quantidade deve ser pelo menos 1.' }),
  validity: z.date({ required_error: 'A data de validade é obrigatória.' }),
  location: z.string().min(1, { message: 'A localização é obrigatória.' }),
  caNumber: z.string().optional(),
  category: z.string().optional(),
});

type EpiFormValues = z.infer<typeof epiFormSchema>;

export default function EpisPage() {
  const { toast } = useToast();
  const [epis, setEpis] = useState<Epi[]>(mockEpis);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const form = useForm<EpiFormValues>({
    resolver: zodResolver(epiFormSchema),
    defaultValues: {
      name: '',
      quantity: 1,
      location: '',
      caNumber: '',
      category: '',
    },
  });

  useEffect(() => {
    if (!isAddModalOpen) {
      form.reset({
        name: '',
        quantity: 1,
        validity: undefined, // Reset date properly
        location: '',
        caNumber: '',
        category: '',
      });
    }
  }, [isAddModalOpen, form]);


  const getValidityStatus = (validityDate: Date, quantity: number): { status: EpiStatus; daysRemaining: number | null } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day
    
    const validDate = new Date(validityDate);
    validDate.setHours(0,0,0,0); // Normalize validityDate to start of day

    const daysRemaining = differenceInDays(validDate, today);

    if (daysRemaining < 0) return { status: 'Expirado', daysRemaining };
    if (daysRemaining <= 30) return { status: 'Próximo Validade', daysRemaining }; // 30 days or less
    if (quantity <= 5) return { status: 'Baixo Estoque', daysRemaining }; // Example low stock threshold
    return { status: 'OK', daysRemaining };
  };

  const totalItems = epis.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = epis.filter(item => item.quantity <= 5).length;
  const expiringSoonItems = epis.filter(item => {
    const { status } = getValidityStatus(item.validity, item.quantity);
    return status === 'Próximo Validade' || status === 'Expirado';
  }).length;

  const getStatusBadgeClass = (status: EpiStatus) => {
    switch (status) {
      case 'OK':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'Baixo Estoque':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'Próximo Validade':
        return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'Expirado':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'Crítico':
        return 'bg-red-700 text-white border-red-900';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };
  
  const getStatusText = (status: EpiStatus) => {
     switch (status) {
      case 'Próximo Validade': return 'Próx. Validade';
      default: return status;
    }
  }

  const handleAddItem = () => {
    form.reset(); // Reset form fields when opening
    setIsAddModalOpen(true);
  };

  const handleViewDetails = (epiId: string) => {
    toast({
      title: 'Ver Detalhes do EPI',
      description: `Funcionalidade para ver detalhes do EPI ${epiId} (com abas: Visão Geral, Histórico de Uso, Anexos) será implementada aqui.`,
    });
  };

  const handleEditItem = (epiId: string) => {
    toast({
      title: 'Editar EPI',
      description: `Funcionalidade para editar o EPI ${epiId} será implementada (provavelmente usando um modal similar ao de adicionar).`,
    });
  };

  async function onFormSubmit(data: EpiFormValues) {
    setIsLoadingForm(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const newItem: Epi = {
      id: `EPI${Math.random().toString(36).substr(2, 3).toUpperCase()}${Date.now() % 1000}`, // simple unique id
      ...data,
    };
    setEpis(prevEpis => [newItem, ...prevEpis]);

    toast({
      title: 'EPI Adicionado com Sucesso!',
      description: `O item "${data.name}" foi adicionado ao inventário.`,
    });
    setIsLoadingForm(false);
    setIsAddModalOpen(false);
  }

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard title="Total de Itens em Estoque" value={totalItems} iconName="Archive" iconColor="text-blue-500" />
        <StatCard title="Itens com Baixo Estoque" value={lowStockItems} iconName="AlertCircle" iconColor="text-yellow-500" subtitle={`${lowStockItems} tipo(s) abaixo do mínimo`} />
        <StatCard title="Validade Crítica (Próx./Expirados)" value={expiringSoonItems} iconName="CalendarClock" iconColor="text-red-500" subtitle={`${expiringSoonItems} tipo(s) requerem atenção`} />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Lista de EPIs</h2>
      </div>
      
      <div className="rounded-lg border shadow-sm bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Nome do Item</TableHead>
                <TableHead className="text-center min-w-[100px]">Quantidade</TableHead>
                <TableHead className="min-w-[120px]">Validade</TableHead>
                <TableHead className="min-w-[150px]">Localização</TableHead>
                <TableHead className="text-center min-w-[120px]">Status</TableHead>
                <TableHead className="text-right min-w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {epis.length > 0 ? epis.map((item) => {
                const { status, daysRemaining } = getValidityStatus(item.validity, item.quantity);
                let validityText = format(item.validity, 'dd/MM/yyyy', { locale: ptBR });
                if (status === 'Próximo Validade' && daysRemaining !== null) {
                  validityText += ` (${daysRemaining}d)`;
                } else if (status === 'Expirado') {
                  validityText = `Expirado`;
                }

                return (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell
                      className={cn(
                        status === 'Expirado' && 'text-red-600 font-semibold',
                        status === 'Próximo Validade' && 'text-orange-600 font-medium'
                      )}
                    >
                      {validityText}
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-xs ${getStatusBadgeClass(status)}`}>
                        {getStatusText(status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Ações para {item.name}</span>
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
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum EPI cadastrado. Comece adicionando um novo item.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" disabled={epis.length === 0}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={epis.length === 0}>
          Próximo
        </Button>
      </div>

      {/* Modal para Adicionar Novo Item de EPI */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Item de EPI</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do novo Equipamento de Proteção Individual.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right col-span-1">
                  Nome
                </Label>
                <div className="col-span-3">
                  <Input id="name" {...form.register('name')} className={cn(form.formState.errors.name && "border-destructive")} />
                  {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right col-span-1">
                  Quantidade
                </Label>
                <div className="col-span-3">
                  <Input id="quantity" type="number" {...form.register('quantity')} className={cn(form.formState.errors.quantity && "border-destructive")} />
                  {form.formState.errors.quantity && <p className="text-xs text-destructive mt-1">{form.formState.errors.quantity.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="validity" className="text-right col-span-1">
                  Validade
                </Label>
                <div className="col-span-3">
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.watch('validity') && "text-muted-foreground",
                           form.formState.errors.validity && "border-destructive"
                        )}
                      >
                        <CalendarIconLucide className="mr-2 h-4 w-4" />
                        {form.watch('validity') ? format(form.watch('validity')!, "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('validity')}
                        onSelect={(date) => form.setValue('validity', date as Date, {shouldValidate: true})}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.validity && <p className="text-xs text-destructive mt-1">{form.formState.errors.validity.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right col-span-1">
                  Localização
                </Label>
                 <div className="col-span-3">
                  <Input id="location" {...form.register('location')} className={cn(form.formState.errors.location && "border-destructive")} />
                  {form.formState.errors.location && <p className="text-xs text-destructive mt-1">{form.formState.errors.location.message}</p>}
                </div>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="caNumber" className="text-right col-span-1">
                  Nº do C.A.
                </Label>
                <div className="col-span-3">
                  <Input id="caNumber" {...form.register('caNumber')} placeholder="Opcional" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right col-span-1">
                  Categoria
                </Label>
                <div className="col-span-3">
                   <Select onValueChange={(value) => form.setValue('category', value)} defaultValue={form.watch('category')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria (Opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="protecao_cabeca">Proteção da Cabeça</SelectItem>
                      <SelectItem value="protecao_respiratoria">Proteção Respiratória</SelectItem>
                      <SelectItem value="protecao_auditiva">Proteção Auditiva</SelectItem>
                      <SelectItem value="protecao_visual">Proteção Visual</SelectItem>
                      <SelectItem value="protecao_maos">Proteção das Mãos</SelectItem>
                      <SelectItem value="protecao_pes">Proteção dos Pés</SelectItem>
                      <SelectItem value="protecao_corpo">Proteção do Corpo</SelectItem>
                      <SelectItem value="combate_incendio">Combate a Incêndio</SelectItem>
                      <SelectItem value="trabalho_altura">Trabalho em Altura</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoadingForm}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoadingForm}>
                {isLoadingForm ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar EPI'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

