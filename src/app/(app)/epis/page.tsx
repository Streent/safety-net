
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button, buttonVariants } from '@/components/ui/button';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, Archive, AlertCircle, CalendarClock, Edit2, MoreHorizontal, Eye, Loader2, Check, Calendar as CalendarIconLucide, CloudUpload, ImageIcon, Filter as FilterIcon, Search, Trash2, FileSpreadsheet, X as XIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths, differenceInDays, isValid, startOfDay, isBefore } from 'date-fns';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription as UiFormDescription, FormMessage as UiFormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle as UiCardTitle, CardDescription as UiCardDescription } from '@/components/ui/card';
import { EpiDetailDrawer } from '@/components/epis/EpiDetailDrawer';


export interface Epi {
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

export const mockEpis: Epi[] = [
  { id: 'EPI001', name: 'Máscara N95 (PFF2)', quantity: 50, validity: addMonths(new Date(), 3), location: 'Almoxarifado A', caNumber: '12345', category: 'protecao_respiratoria', minimumStock: 10, responsible: 'Carlos Silva', photoUrls: ['https://placehold.co/100x100.png', 'https://placehold.co/100x100.png'] },
  { id: 'EPI002', name: 'Capacete de Segurança Amarelo', quantity: 5, validity: addMonths(new Date(), 12), location: 'Estante B1', category: 'protecao_cabeca', minimumStock: 8, responsible: 'Ana Lima' },
  { id: 'EPI003', name: 'Luvas de Proteção (par) Tamanho M', quantity: 20, validity: addMonths(new Date(), -1), location: 'Almoxarifado A', category: 'protecao_maos', minimumStock: 10, responsible: 'Carlos Silva' }, // Expirado
  { id: 'EPI004', name: 'Protetor Auricular Plug Silicone', quantity: 10, validity: addMonths(new Date(), 0.5), location: 'Estante C3', caNumber: '67890', category: 'protecao_auditiva', minimumStock: 25, responsible: 'João Souza' }, // Validade Crítica (aprox. 15 dias) e Baixo Estoque
  { id: 'EPI005', name: 'Óculos de Segurança Incolor', quantity: 15, validity: addMonths(new Date(), 6), location: 'Almoxarifado B', category: 'protecao_visual', minimumStock: 5, responsible: 'Maria Oliveira', photoUrls: ['https://placehold.co/100x100.png'] },
  { id: 'EPI006', name: 'Extintor ABC (2kg) - Corredor', quantity: 2, validity: startOfDay(new Date()), location: 'Corredor Principal', category: 'combate_incendio', minimumStock: 1, responsible: 'Equipe de Segurança' }, // Validade Crítica (hoje)
  { id: 'EPI007', name: 'Cinto de Segurança para Altura Completo', quantity: 8, validity: addMonths(new Date(), 24), location: 'Sala de Equipamentos', caNumber: '11223', category: 'trabalho_altura', minimumStock: 2, responsible: 'José Santos' },
  { id: 'EPI008', name: 'Botina de Segurança com Bico de Aço Tam 42', quantity: 3, validity: addMonths(new Date(), 1), location: 'Vestiário Obra X', category: 'protecao_pes', minimumStock: 5, responsible: 'Pedro Costa' }, // Próximo Validade (1 mês) e Baixo Estoque
];

const epiFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome do item deve ter pelo menos 3 caracteres.' }),
  quantity: z.coerce.number().min(0, { message: 'A quantidade deve ser 0 ou mais.' }),
  validity: z.date({
    required_error: 'A data de validade é obrigatória.',
  }).refine(date => !isBefore(startOfDay(date), startOfDay(new Date())), {
    message: "A data de validade não pode ser uma data passada."
  }),
  location: z.string().min(1, { message: 'A localização é obrigatória.' }),
  caNumber: z.string().optional(),
  category: z.string().optional(),
  photos: z.any().optional().describe('Arquivos de fotos do EPI'),
  minimumStock: z.coerce.number().min(0, { message: 'O estoque mínimo deve ser 0 ou mais.' }).optional().default(0),
  responsible: z.string().optional(),
});

type EpiFormValues = z.infer<typeof epiFormSchema>;

export default function EpisPage() {
  const { toast } = useToast();
  const [epis, setEpis] = useState<Epi[]>(mockEpis);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  const [editingEpi, setEditingEpi] = useState<Epi | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [epiToDelete, setEpiToDelete] = useState<Epi | null>(null);


  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [locationFilter, setLocationFilter] = useState('');

  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedEpiForDetail, setSelectedEpiForDetail] = useState<Epi | null>(null);


  const form = useForm<EpiFormValues>({
    resolver: zodResolver(epiFormSchema),
    defaultValues: {
      name: '',
      quantity: 1,
      validity: undefined,
      location: '',
      caNumber: '',
      category: '',
      photos: undefined,
      minimumStock: 0,
      responsible: '',
    },
  });

  const resetAndCloseModal = useCallback(() => {
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
    
    photoPreviewUrls.forEach(url => {
      if (url.startsWith('blob:')) { // Only revoke blob URLs
        URL.revokeObjectURL(url);
      }
    });
    setPhotoPreviewUrls([]);
    setPhotoFiles([]);

    setEditingEpi(null);
    setIsAddModalOpen(false);
  }, [form, photoPreviewUrls]);


  useEffect(() => {
    if (!isAddModalOpen) {
      return;
    }
    
    if (editingEpi) {
      form.reset({
        name: editingEpi.name,
        quantity: editingEpi.quantity,
        validity: new Date(editingEpi.validity), 
        location: editingEpi.location,
        caNumber: editingEpi.caNumber || '',
        category: editingEpi.category || '',
        minimumStock: editingEpi.minimumStock ?? 0,
        responsible: editingEpi.responsible || '',
        photos: undefined, 
      });
      
      photoPreviewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      setPhotoPreviewUrls(editingEpi.photoUrls || []); 
      setPhotoFiles([]);
    } else {
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
      photoPreviewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      setPhotoFiles([]);
      setPhotoPreviewUrls([]);
    }
  }, [isAddModalOpen, editingEpi, form, photoPreviewUrls]);


  const getValidityStatus = useCallback((validityDateInput: Date | string, quantity: number, minimumStock?: number): { status: EpiStatus; daysRemaining: number | null; isLowStock: boolean } => {
    const today = startOfDay(new Date());
    const validityDate = startOfDay(new Date(validityDateInput)); 
    
    if (!isValid(validityDate)) {
      return { status: 'Expirado', daysRemaining: null, isLowStock: false };
    }

    const daysRemaining = differenceInDays(validityDate, today);
    const minStockVal = minimumStock === undefined || minimumStock < 0 ? 0 : minimumStock;
    const isLowStock = quantity <= minStockVal;

    let status: EpiStatus;

    if (daysRemaining < 0) {
      status = 'Expirado';
    } else if (daysRemaining < 15) { 
      status = 'Validade Crítica';
    } else if (daysRemaining <= 30) { 
      status = 'Próximo Validade';
    } else if (isLowStock) {
        status = 'Baixo Estoque';
    } else { 
      status = 'OK';
    }
        
    return { status, daysRemaining, isLowStock };
  }, []);

  const totalItems = epis.reduce((sum, item) => sum + item.quantity, 0);
  
  const lowStockItemsCount = useMemo(() => epis.filter(item => {
    const { isLowStock, status } = getValidityStatus(item.validity, item.quantity, item.minimumStock);
    return isLowStock && status !== 'Expirado' && status !== 'Validade Crítica'; 
  }).length, [epis, getValidityStatus]);

  const criticalValidityItemsCount = useMemo(() => epis.filter(item => {
    const { status } = getValidityStatus(item.validity, item.quantity, item.minimumStock);
    return status === 'Próximo Validade' || status === 'Validade Crítica' || status === 'Expirado';
  }).length, [epis, getValidityStatus]);


  const getStatusBadgeClass = (status: EpiStatus | string) => {
    switch (status) {
      case 'OK':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'Baixo Estoque': 
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'Próximo Validade': 
        return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
      case 'Validade Crítica': 
        return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'Expirado':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };
  
  const getStatusText = (status: EpiStatus | string) => {
     switch (status) {
      case 'Próximo Validade': return 'Próx. Val.';
      case 'Validade Crítica': return 'Val. Crítica';
      default: return status;
    }
  }

  const handleOpenModal = (epiToEdit: Epi | null = null) => {
    setEditingEpi(epiToEdit);
    setIsAddModalOpen(true);
  };

  const handleViewDetails = (epi: Epi) => {
    setSelectedEpiForDetail(epi);
    setIsDetailDrawerOpen(true);
  };
  
  const handleDeleteEpi = (epi: Epi) => {
    setEpiToDelete(epi);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (epiToDelete) {
      setEpis(prevEpis => prevEpis.filter(e => e.id !== epiToDelete.id));
      toast({
        title: 'EPI Excluído!',
        description: `O item "${epiToDelete.name}" foi excluído do inventário.`,
        variant: 'destructive',
      });
    }
    setShowDeleteConfirm(false);
    setEpiToDelete(null);
  };
  
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    photoPreviewUrls.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });

    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      setPhotoFiles(filesArray);
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(newPreviewUrls);
      form.setValue('photos', filesArray, { shouldValidate: true }); 
    } else {
      setPhotoFiles([]);
      setPhotoPreviewUrls([]);
      form.setValue('photos', undefined, { shouldValidate: true });
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    if (photoPreviewUrls[indexToRemove]?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreviewUrls[indexToRemove]); 
    }
    
    const updatedFiles = photoFiles.filter((_, index) => index !== indexToRemove);
    const updatedPreviewUrls = photoPreviewUrls.filter((_, index) => index !== indexToRemove);
    
    setPhotoFiles(updatedFiles);
    setPhotoPreviewUrls(updatedPreviewUrls);
    form.setValue('photos', updatedFiles.length > 0 ? updatedFiles : undefined, { shouldValidate: true });
  };


  async function onFormSubmit(data: EpiFormValues) {
    setIsLoadingForm(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    let finalPhotoUrls: string[] = [];
    if (photoFiles.length > 0) {
      finalPhotoUrls = photoPreviewUrls.filter(url => url.startsWith('blob:')); 
    } else if (editingEpi && editingEpi.photoUrls) {
      finalPhotoUrls = editingEpi.photoUrls; 
    }
    
    const newOrUpdatedEpi: Epi = {
      id: editingEpi ? editingEpi.id : `EPI${Math.random().toString(36).substr(2, 3).toUpperCase()}${Date.now() % 1000}`,
      name: data.name,
      quantity: data.quantity,
      validity: data.validity,
      location: data.location,
      caNumber: data.caNumber,
      category: data.category,
      minimumStock: data.minimumStock === undefined ? 0 : data.minimumStock,
      responsible: data.responsible,
      photoUrls: finalPhotoUrls,
    };

    if (editingEpi) {
      setEpis(prevEpis => prevEpis.map(e => e.id === editingEpi.id ? newOrUpdatedEpi : e));
      toast({
        title: 'EPI Atualizado!',
        description: `O item "${data.name}" foi atualizado com sucesso.`,
      });
    } else {
      setEpis(prevEpis => [newOrUpdatedEpi, ...prevEpis]);
      toast({
        title: 'EPI Adicionado com Sucesso!',
        description: `O item "${data.name}" foi adicionado ao inventário.`,
      });
    }
    
    setIsLoadingForm(false);
    resetAndCloseModal();
  }

  const filteredEpis = useMemo(() => {
    return epis.filter(item => {
      const { status: itemStatus } = getValidityStatus(item.validity, item.quantity, item.minimumStock);
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'Todos' || itemStatus === statusFilter;
      const locationMatch = !locationFilter || item.location.toLowerCase().includes(locationFilter.toLowerCase());
      return nameMatch && statusMatch && locationMatch;
    });
  }, [epis, searchTerm, statusFilter, locationFilter, getValidityStatus]);


  return (
    <>
      <PageHeader
        title="Gerenciamento de EPIs"
        description="Monitore o inventário, validades e uso de Equipamentos de Proteção Individual."
        actions={
          <div className="flex gap-2">
            <Button onClick={() => handleOpenModal(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
            <Button asChild variant="outline">
              <Link href="/epis/distribuicao">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Registrar Distribuição</span>
              </Link>
            </Button>
          </div>
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
                <UiCardTitle className="text-lg">Filtros do Inventário</UiCardTitle>
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
                        <SelectValue />
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
      
      <Card className="shadow-sm">
        <CardHeader>
             <UiCardTitle>Lista de EPIs Cadastrados</UiCardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
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
                    let validityText = isValid(new Date(item.validity)) ? format(new Date(item.validity), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A';
                    if ((status === 'Próximo Validade' || status === 'Validade Crítica') && daysRemaining !== null && daysRemaining >= 0) {
                      validityText += ` (${daysRemaining}d)`;
                    } else if (status === 'Expirado' && isValid(new Date(item.validity))) {
                      validityText = `Expirou em ${format(new Date(item.validity), 'dd/MM/yyyy', { locale: ptBR })}`;
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
                              <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Ver Detalhes</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenModal(item)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              {item.name.toLowerCase().includes("extintor") && (
                                <DropdownMenuItem onClick={() => toast({title: "Registrar Uso de Extintor", description:"Funcionalidade para registrar uso e disparar manutenção."})}>
                                    <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                                    <span className="text-destructive">Registrar Uso</span>
                                </DropdownMenuItem>
                              )}
                               <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteEpi(item)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive/90 hover:text-destructive-foreground hover:!bg-destructive/90" >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
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
        </CardContent>
      </Card>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" disabled={filteredEpis.length === 0}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={filteredEpis.length === 0}>
          Próximo
        </Button>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={(isOpen) => { if (!isOpen) resetAndCloseModal(); else setIsAddModalOpen(true); }}>
        <DialogContent className="w-full max-w-md p-4 sm:p-6 sm:max-w-lg">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)}>
              <DialogHeader>
                <DialogTitle>{editingEpi ? 'Editar Item de EPI' : 'Adicionar Novo Item de EPI'}</DialogTitle>
                <DialogDescription>
                  {editingEpi ? 'Atualize os detalhes do Equipamento de Proteção Individual.' : 'Preencha os detalhes do novo Equipamento de Proteção Individual.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-x-4 gap-y-2 sm:gap-y-4">
                      <FormLabel className="sm:text-right sm:col-span-1">Nome</FormLabel>
                      <FormControl className="sm:col-span-3">
                        <Input {...field} className={cn(form.formState.errors.name && "border-destructive")} />
                      </FormControl>
                      <UiFormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
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
                      <UiFormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
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
                        <Input type="number" {...field} placeholder="0" className={cn(form.formState.errors.minimumStock && "border-destructive")} />
                      </FormControl>
                      <UiFormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
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
                              {field.value && isValid(new Date(field.value)) ? format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
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
                            disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                          />
                        </PopoverContent>
                      </Popover>
                      <UiFormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
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
                      <UiFormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
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
                       <UiFormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
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
                       <UiFormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-x-4 gap-y-2 sm:gap-y-4">
                      <FormLabel className="sm:text-right sm:col-span-1">Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
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
                       <UiFormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photos"
                  render={({ field: { onChange, value, ...restField } }) => ( 
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
                            onChange={handlePhotoChange} 
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            {...restField}
                          />
                        </FormControl>
                        {photoPreviewUrls.length > 0 && (
                          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {photoPreviewUrls.map((url, index) => (
                              <div key={url} className="relative group aspect-square">
                                <Image 
                                  src={url} 
                                  alt={`Pré-visualização ${index + 1}`} 
                                  width={100} 
                                  height={100} 
                                  className="object-cover w-full h-full rounded-md border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemovePhoto(index)}
                                >
                                  <XIcon className="h-4 w-4" />
                                  <span className="sr-only">Remover imagem</span>
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                         <UiFormDescription className="text-xs mt-1 flex items-center">
                           <ImageIcon className="h-3 w-3 mr-1.5"/>
                           Anexe uma ou mais fotos do EPI (opcional).
                         </UiFormDescription>
                         <UiFormMessage className="text-xs sm:col-start-2 sm:col-span-3" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoadingForm} onClick={resetAndCloseModal}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoadingForm || !form.formState.isValid}>
                  {isLoadingForm ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    editingEpi ? 'Salvar Alterações' : 'Salvar EPI'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item "{epiToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEpiToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EpiDetailDrawer
        epi={selectedEpiForDetail}
        isOpen={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
        getValidityStatus={getValidityStatus}
        getStatusBadgeClass={getStatusBadgeClass}
        getStatusText={getStatusText}
      />
    </>
  );
}
