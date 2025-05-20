
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
import { PlusCircle, Archive, AlertCircle, CalendarClock, Edit2, MoreHorizontal, Eye, Loader2, Check, Calendar as CalendarIconLucide, CloudUpload, ImageIcon } from 'lucide-react';
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
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from "@/components/ui/form";


interface Epi {
  id: string;
  name: string;
  quantity: number;
  validity: Date;
  location: string;
  category?: string;
  caNumber?: string;
  photoUrls?: string[]; // Para armazenar URLs das fotos futuramente
}

type EpiStatus = 'OK' | 'Baixo Estoque' | 'Próximo Validade' | 'Expirado' | 'Crítico';

const mockEpis: Epi[] = [
  { id: 'EPI001', name: 'Máscara N95', quantity: 50, validity: addMonths(new Date(), 3), location: 'Almoxarifado A', caNumber: '12345' },
  { id: 'EPI002', name: 'Capacete de Segurança', quantity: 5, validity: addMonths(new Date(), 12), location: 'Estante B1', category: 'protecao_cabeca' },
  { id: 'EPI003', name: 'Luvas de Proteção (par)', quantity: 20, validity: addMonths(new Date(), -1), location: 'Almoxarifado A' },
  { id: 'EPI004', name: 'Protetor Auricular', quantity: 30, validity: addMonths(new Date(), 1), location: 'Estante C3', caNumber: '67890', category: 'protecao_auditiva' },
  { id: 'EPI005', name: 'Óculos de Segurança', quantity: 15, validity: addMonths(new Date(), 6), location: 'Almoxarifado B' },
  { id: 'EPI006', name: 'Extintor ABC (2kg)', quantity: 2, validity: addMonths(new Date(), 0), location: 'Corredor Principal', category: 'combate_incendio' },
  { id: 'EPI007', name: 'Cinto de Segurança para Altura', quantity: 8, validity: addMonths(new Date(), 24), location: 'Sala de Equipamentos', caNumber: '11223', category: 'trabalho_altura' },
];

const epiFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome do item deve ter pelo menos 3 caracteres.' }),
  quantity: z.coerce.number().min(1, { message: 'A quantidade deve ser pelo menos 1.' }),
  validity: z.date({ required_error: 'A data de validade é obrigatória.' }),
  location: z.string().min(1, { message: 'A localização é obrigatória.' }),
  caNumber: z.string().optional(),
  category: z.string().optional(),
  photos: z.any().optional().describe('Arquivos de fotos do EPI'),
});

type EpiFormValues = z.infer<typeof epiFormSchema>;

export default function EpisPage() {
  const { toast } = useToast();
  const [epis, setEpis] = useState<Epi[]>(mockEpis);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);


  const form = useForm<EpiFormValues>({
    resolver: zodResolver(epiFormSchema),
    defaultValues: {
      name: '',
      quantity: 1,
      location: '',
      caNumber: '',
      category: '',
      photos: undefined,
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
      });
      setPhotoFiles([]); // Limpar arquivos de fotos ao fechar o modal
    }
  }, [isAddModalOpen, form]);


  const getValidityStatus = (validityDate: Date, quantity: number): { status: EpiStatus; daysRemaining: number | null } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const validDate = new Date(validityDate);
    validDate.setHours(0,0,0,0);

    const daysRemaining = differenceInDays(validDate, today);

    if (daysRemaining < 0) return { status: 'Expirado', daysRemaining };
    if (daysRemaining <= 30) return { status: 'Próximo Validade', daysRemaining };
    if (quantity <= 5) return { status: 'Baixo Estoque', daysRemaining }; 
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
    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    console.log("Dados do EPI:", data);
    console.log("Arquivos de fotos selecionados:", photoFiles.map(f => f.name));


    const newItem: Epi = {
      id: `EPI${Math.random().toString(36).substr(2, 3).toUpperCase()}${Date.now() % 1000}`,
      ...data,
      // Futuramente, photoUrls seriam os URLs após o upload para o Firebase Storage
      photoUrls: photoFiles.map(file => URL.createObjectURL(file)), // Placeholder para visualização local
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
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right col-span-1">Nome</FormLabel>
                      <FormControl className="col-span-3">
                        <Input {...field} className={cn(form.formState.errors.name && "border-destructive")} />
                      </FormControl>
                      <FormMessage className="col-start-2 col-span-3 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right col-span-1">Quantidade</FormLabel>
                      <FormControl className="col-span-3">
                        <Input type="number" {...field} className={cn(form.formState.errors.quantity && "border-destructive")} />
                      </FormControl>
                      <FormMessage className="col-start-2 col-span-3 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validity"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right col-span-1">Validade</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild className="col-span-3">
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
                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } // Não permite datas passadas
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="col-start-2 col-span-3 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right col-span-1">Localização</FormLabel>
                      <FormControl className="col-span-3">
                        <Input {...field} className={cn(form.formState.errors.location && "border-destructive")} />
                      </FormControl>
                      <FormMessage className="col-start-2 col-span-3 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caNumber"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right col-span-1">Nº do C.A.</FormLabel>
                      <FormControl className="col-span-3">
                        <Input {...field} placeholder="Opcional" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right col-span-1">Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl className="col-span-3">
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
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photos"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-start gap-4">
                      <FormLabel className="text-right col-span-1 pt-2">
                        <CloudUpload className="inline h-4 w-4 mr-1.5" /> Fotos
                      </FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            onChange={(e) => {
                              field.onChange(e.target.files); // Para react-hook-form
                              handlePhotoChange(e); // Para nosso estado local de arquivos
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

