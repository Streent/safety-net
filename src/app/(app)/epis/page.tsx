
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { PlusCircle, Archive, AlertCircle, CalendarClock, Edit2, MoreHorizontal, Eye, Loader2, Check, Calendar as CalendarIconLucide, CloudUpload, ImageIcon, Filter as FilterIcon, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths, differenceInDays, isValid, startOfDay } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Added import
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader } from '@/components/ui/card';


interface Epi {
  id: string;
  name: string;
  quantity: number;
  validity: Date;
  location: string;
  category?: string;
  caNumber?: string;
  photoUrls?: string[];
  minimumStock?: number;
  responsible?: string;
}

type EpiStatus = 'OK' | 'Baixo Estoque' | 'Próximo Validade' | 'Validade Crítica' | 'Expirado';

const mockEpis: Epi[] = [
  { id: 'EPI001', name: 'Máscara N95 (PFF2)', quantity: 50, validity: addMonths(new Date(), 3), location: 'Almoxarifado A', caNumber: '12345', category: 'protecao_respiratoria', minimumStock: 10 },
  { id: 'EPI002', name: 'Capacete de Segurança Amarelo', quantity: 5, validity: addMonths(new Date(), 12), location: 'Estante B1', category: 'protecao_cabeca', minimumStock: 3 },
  { id: 'EPI003', name: 'Luvas de Proteção (par) Tamanho M', quantity: 20, validity: addMonths(new Date(), -1), location: 'Almoxarifado A', category: 'protecao_maos', minimumStock: 10 },
  { id: 'EPI004', name: 'Protetor Auricular Plug Silicone', quantity: 30, validity: addMonths(new Date(), 0.5), location: 'Estante C3', caNumber: '67890', category: 'protecao_auditiva', minimumStock: 20 }, // 0.5 months = ~15 days
  { id: 'EPI005', name: 'Óculos de Segurança Incolor', quantity: 15, validity: addMonths(new Date(), 6), location: 'Almoxarifado B', category: 'protecao_visual', minimumStock: 5 },
  { id: 'EPI006', name: 'Extintor ABC (2kg) - Corredor', quantity: 2, validity: addMonths(new Date(), 0), location: 'Corredor Principal', category: 'combate_incendio', minimumStock: 1 }, // 0 months = hoje
  { id: 'EPI007', name: 'Cinto de Segurança para Altura Completo', quantity: 8, validity: addMonths(new Date(), 24), location: 'Sala de Equipamentos', caNumber: '11223', category: 'trabalho_altura', minimumStock: 2 },
  { id: 'EPI008', name: 'Botina de Segurança com Bico de Aço Tam 42', quantity: 3, validity: addMonths(new Date(), 1), location: 'Vestiário Obra X', category: 'protecao_pes', minimumStock: 5 }, // 1 month
];

const epiFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome do item deve ter pelo menos 3 caracteres.' }),
  quantity: z.coerce.number().min(0, { message: 'A quantidade deve ser 0 ou mais.' }), // Permitir 0 para registrar item sem estoque inicial
  validity: z.date({ required_error: 'A data de validade é obrigatória.' }),
  location: z.string().min(1, { message: 'A localização é obrigatória.' }),
  caNumber: z.string().optional(),
  category: z.string().optional(),
  photos: z.any().optional().describe('Arquivos de fotos do EPI'),
  minimumStock: z.coerce.number().min(0, { message: 'O estoque mínimo deve ser 0 ou mais.' }).optional(),
  responsible: z.string().optional(),
});

type EpiFormValues = z.infer<typeof epiFormSchema>;

export default function EpisPage() {
  const { toast } = useToast();
  const [epis, setEpis] = useState<Epi[]>(mockEpis);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [locationFilter, setLocationFilter] = useState('');


  const form = useForm<EpiFormValues>({
    resolver: zodResolver(epiFormSchema),
    defaultValues: {
      name: '',
      quantity: 1,
      location: '',
      caNumber: '',
      category: '',
      photos: undefined,
      minimumStock: 0,
      responsible: '',
    },
  });

  useEffect(() => {
    if (!isAddModalOpen) {
      form.reset({
        name: '',
        quantity: 1,
        validity: undefined,
        location: '',
        caNumber: '',
        category: '',
        photos: undefined,
        minimumStock: 0,
        responsible: '',
      });
      setPhotoFiles([]);
    }
  }, [isAddModalOpen, form]);


  const getValidityStatus = (validityDate: Date, quantity: number, minimumStock?: number): { status: EpiStatus; daysRemaining: number | null; isLowStock: boolean } => {
    const today = startOfDay(new Date());
    const validDate = startOfDay(new Date(validityDate));
    const daysRemaining = differenceInDays(validDate, today);
    const minStock = minimumStock || 0;
    const isLowStock = quantity <= minStock;

    let status: EpiStatus;

    if (daysRemaining < 0) {
      status = 'Expirado';
    } else if (daysRemaining < 15) { // 0-14 dias
      status = 'Validade Crítica';
    } else if (daysRemaining <= 30) { // 15-30 dias
      status = 'Próximo Validade';
    } else if (isLowStock) { // Apenas se não for crítico por validade
      status = 'Baixo Estoque';
    } else {
      status = 'OK';
    }
    
    // Se está Expirado ou em Validade Crítica, esse status tem precedência sobre Baixo Estoque na determinação primária.
    // A flag isLowStock pode ser usada para exibir um alerta adicional se necessário.
    if ((status === 'Expirado' || status === 'Validade Crítica' || status === 'Próximo Validade') && isLowStock) {
        // O status primário continua sendo o de validade, mas sabemos que também está baixo.
        // Para fins de cor do badge, a validade é mais crítica.
    } else if (isLowStock && status === 'OK') { // Se está OK na validade, mas baixo estoque
        status = 'Baixo Estoque';
    }


    return { status, daysRemaining, isLowStock };
  };

  const totalItems = epis.reduce((sum, item) => sum + item.quantity, 0);
  
  const lowStockItemsCount = epis.filter(item => {
    const { isLowStock, status } = getValidityStatus(item.validity, item.quantity, item.minimumStock);
    return isLowStock && status !== 'Expirado'; // Conta como baixo estoque se não estiver expirado
  }).length;

  const criticalValidityItemsCount = epis.filter(item => {
    const { status } = getValidityStatus(item.validity, item.quantity, item.minimumStock);
    return status === 'Próximo Validade' || status === 'Validade Crítica' || status === 'Expirado';
  }).length;


  const getStatusBadgeClass = (status: EpiStatus) => {
    switch (status) {
      case 'OK':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'Baixo Estoque':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'Próximo Validade': // 15-30 dias
        return 'bg-amber-500/20 text-amber-700 border-amber-500/30'; // Amarelo mais forte
      case 'Validade Crítica': // 0-14 dias
        return 'bg-orange-500/20 text-orange-700 border-orange-500/30'; // Laranja
      case 'Expirado':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };
  
  const getStatusText = (status: EpiStatus) => {
     switch (status) {
      case 'Próximo Validade': return 'Próx. Validade';
      case 'Validade Crítica': return 'Val. Crítica';
      default: return status;
    }
  }

  const handleAddItem = () => {
    form.reset(); 
    setPhotoFiles([]);
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
  
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setPhotoFiles(Array.from(event.target.files));
    }
  };

  async function onFormSubmit(data: EpiFormValues) {
    setIsLoadingForm(true);
    // Simula chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    console.log("Dados do EPI:", data);
    console.log("Arquivos de fotos selecionados:", photoFiles.map(f => f.name));


    const newItem: Epi = {
      id: `EPI${Math.random().toString(36).substr(2, 3).toUpperCase()}${Date.now() % 1000}`,
      ...data,
      minimumStock: data.minimumStock || 0, // Garantir que seja um número
      photoUrls: photoFiles.map(file => URL.createObjectURL(file)), // Para demonstração, não persistente
    };
    setEpis(prevEpis => [newItem, ...prevEpis]);

    toast({
      title: 'EPI Adicionado com Sucesso!',
      description: `O item "${data.name}" foi adicionado ao inventário.`,
    });
    setIsLoadingForm(false);
    setIsAddModalOpen(false);
  }

  const filteredEpis = useMemo(() => {
    return epis.filter(item => {
      const { status } = getValidityStatus(item.validity, item.quantity, item.minimumStock);
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'Todos' || status === statusFilter;
      const locationMatch = item.location.toLowerCase().includes(locationFilter.toLowerCase());
      return nameMatch && statusMatch && locationMatch;
    });
  }, [epis, searchTerm, statusFilter, locationFilter]);


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
        <StatCard title="Itens com Baixo Estoque" value={lowStockItemsCount} iconName="AlertCircle" iconColor="text-yellow-500" subtitle={`${lowStockItemsCount} item(ns) abaixo do mínimo`} />
        <StatCard title="Validade Preocupante" value={criticalValidityItemsCount} iconName="CalendarClock" iconColor="text-red-500" subtitle={`${criticalValidityItemsCount} item(ns) requerem atenção`} />
      </div>

      <Card className="mb-6 shadow">
        <CardHeader>
            <div className="flex items-center">
                <FilterIcon className="h-5 w-5 mr-2 text-primary"/>
                <h3 className="text-lg font-semibold">Filtros do Inventário</h3>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
            <div>
                <Label htmlFor="searchTerm" className="text-sm font-medium">Buscar por Nome</Label>
                <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="searchTerm"
                        placeholder="Digite o nome do EPI..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-ai-hint="nome do EPI"
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="statusFilter" className="text-sm font-medium">Filtrar por Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="statusFilter" className="mt-1">
                        <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Todos">Todos os Status</SelectItem>
                        <SelectItem value="OK">OK</SelectItem>
                        <SelectItem value="Baixo Estoque">Baixo Estoque</SelectItem>
                        <SelectItem value="Próximo Validade">Próximo Validade</SelectItem>
                        <SelectItem value="Validade Crítica">Validade Crítica</SelectItem>
                        <SelectItem value="Expirado">Expirado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="locationFilter" className="text-sm font-medium">Filtrar por Localização</Label>
                 <Input 
                    id="locationFilter"
                    placeholder="Digite a localização..."
                    className="mt-1"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    data-ai-hint="localização do EPI"
                />
            </div>
        </CardContent>
      </Card>
      
      <div className="rounded-lg border shadow-sm bg-card">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Nome do Item</TableHead>
                <TableHead className="text-center min-w-[100px]">Quantidade</TableHead>
                <TableHead className="min-w-[150px]">Validade</TableHead>
                <TableHead className="min-w-[150px]">Localização</TableHead>
                <TableHead className="text-center min-w-[120px]">Status</TableHead>
                <TableHead className="text-right min-w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEpis.length > 0 ? filteredEpis.map((item) => {
                const { status, daysRemaining } = getValidityStatus(item.validity, item.quantity, item.minimumStock);
                let validityText = format(item.validity, 'dd/MM/yyyy', { locale: ptBR });
                if (status === 'Próximo Validade' && daysRemaining !== null) {
                  validityText += ` (${daysRemaining}d)`;
                } else if (status === 'Validade Crítica' && daysRemaining !== null) {
                   validityText += ` (${daysRemaining}d)`;
                } else if (status === 'Expirado') {
                  validityText = `Expirado em ${format(item.validity, 'dd/MM/yyyy', { locale: ptBR })}`;
                }

                return (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell
                      className={cn(
                        status === 'Expirado' && 'text-red-600 font-semibold',
                        (status === 'Validade Crítica') && 'text-orange-600 font-medium',
                        (status === 'Próximo Validade') && 'text-amber-600 font-medium'
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
                    Nenhum EPI encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" disabled={filteredEpis.length === 0}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={filteredEpis.length === 0}>
          Próximo
        </Button>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="w-full max-w-md p-4 sm:p-6 sm:max-w-lg">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)}>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Item de EPI</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do novo Equipamento de Proteção Individual.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-x-4 gap-y-2 sm:gap-y-4">
                      <FormLabel className="sm:text-right sm:col-span-1">Nome</FormLabel>
                      <FormControl className="sm:col-span-3">
                        <Input {...field} className={cn(form.formState.errors.name && "border-destructive")} />
                      </FormControl>
                      <FormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-x-4 gap-y-2 sm:gap-y-4">
                      <FormLabel className="sm:text-right sm:col-span-1">Quantidade</FormLabel>
                      <FormControl className="sm:col-span-3">
                        <Input type="number" {...field} className={cn(form.formState.errors.quantity && "border-destructive")} />
                      </FormControl>
                      <FormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="minimumStock"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-x-4 gap-y-2 sm:gap-y-4">
                      <FormLabel className="sm:text-right sm:col-span-1">Estoque Mínimo</FormLabel>
                      <FormControl className="sm:col-span-3">
                        <Input type="number" {...field} placeholder="Opcional" className={cn(form.formState.errors.minimumStock && "border-destructive")} />
                      </FormControl>
                      <FormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validity"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-x-4 gap-y-2 sm:gap-y-4">
                      <FormLabel className="sm:text-right sm:col-span-1">Validade</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild className="sm:col-span-3">
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                                form.formState.errors.validity && "border-destructive"
                              )}
                            >
                              <CalendarIconLucide className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                            disabled={(date) => date < startOfDay(new Date()) } // Não permitir datas passadas
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-x-4 gap-y-2 sm:gap-y-4">
                      <FormLabel className="sm:text-right sm:col-span-1">Localização</FormLabel>
                      <FormControl className="sm:col-span-3">
                        <Input {...field} className={cn(form.formState.errors.location && "border-destructive")} />
                      </FormControl>
                      <FormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="responsible"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-x-4 gap-y-2 sm:gap-y-4">
                      <FormLabel className="sm:text-right sm:col-span-1">Responsável</FormLabel>
                      <FormControl className="sm:col-span-3">
                        <Input {...field} placeholder="Opcional" />
                      </FormControl>
                       <FormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caNumber"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-x-4 gap-y-2 sm:gap-y-4">
                      <FormLabel className="sm:text-right sm:col-span-1">Nº do C.A.</FormLabel>
                      <FormControl className="sm:col-span-3">
                        <Input {...field} placeholder="Opcional" />
                      </FormControl>
                       <FormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-x-4 gap-y-2 sm:gap-y-4">
                      <FormLabel className="sm:text-right sm:col-span-1">Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl className="sm:col-span-3">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione (Opcional)" />
                          </SelectTrigger>
                        </FormControl>
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
                       <FormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photos"
                  render={({ field }) => ( // field.onChange é importante aqui para react-hook-form
                    <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-start gap-x-4 gap-y-2 sm:gap-y-4">
                      <FormLabel className="sm:text-right sm:col-span-1 pt-2">
                        <CloudUpload className="inline h-4 w-4 mr-1.5" /> Fotos
                      </FormLabel>
                      <div className="sm:col-span-3">
                        <FormControl>
                          <Input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            onChange={(e) => {
                              field.onChange(e.target.files); // Atualiza o valor do react-hook-form
                              handlePhotoChange(e); // Atualiza o estado local para preview
                            }}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                          />
                        </FormControl>
                        {photoFiles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-muted-foreground">Arquivos Selecionados ({photoFiles.length}):</p>
                            <ul className="list-disc list-inside text-xs text-muted-foreground max-h-20 overflow-y-auto">
                              {photoFiles.map(file => <li key={file.name}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>)}
                            </ul>
                          </div>
                        )}
                         <UiFormDescription className="text-xs mt-1 flex items-center">
                           <ImageIcon className="h-3 w-3 mr-1.5"/>
                           Anexe uma ou mais fotos do EPI (opcional).
                         </UiFormDescription>
                         <FormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
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
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}


    