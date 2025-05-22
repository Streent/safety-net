// src/components/fleet/request-vehicle-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Check, CloudUpload, ImageIcon, Loader2, Car, MapPin, FileUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from "@/components/ui/form";
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Schema Zod atualizado conforme especificação (mais detalhado)
const requestVehicleFormSchema = z.object({
  pickupLocation: z.string().min(1, { message: 'O local de partida é obrigatório.' }),
  destination: z.string().min(3, { message: 'O destino deve ter pelo menos 3 caracteres.' }),
  startDate: z.date({ required_error: 'A data de início é obrigatória.' }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Hora de início inválida (HH:MM).' }),
  endDate: z.date({ required_error: 'A data de término é obrigatória.' }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Hora de término inválida (HH:MM).' }),
  purpose: z.string().min(10, { message: 'O motivo deve ter pelo menos 10 caracteres.' }),
  photos: z.any().optional().describe('Fotos adicionais para a solicitação (opcional)'),
  vehicleId: z.string().optional().describe('ID do veículo, se a solicitação for para um específico'),
})
.refine(data => {
    const startDateTime = new Date(data.startDate);
    const [startHours, startMinutes] = data.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);

    const endDateTime = new Date(data.endDate);
    const [endHours, endMinutes] = data.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes);
    
    return endDateTime > startDateTime;
}, {
    message: 'A data/hora de término deve ser posterior à data/hora de início.',
    path: ['endDate'], 
})
.refine(data => new Date(data.startDate) >= new Date(new Date().setHours(0,0,0,0)), {
    message: 'A data de início não pode ser no passado.',
    path: ['startDate'],
});

type RequestVehicleFormValues = z.infer<typeof requestVehicleFormSchema>;

// Opções de local de partida (exemplo)
const pickupLocationOptions = [
  { id: 'sede', label: 'Sede da Empresa' },
  { id: 'garagem_a', label: 'Garagem Filial A - Logística' },
  { id: 'obra_cliente_y', label: 'Obra Cliente Y - Centro' },
  { id: 'almoxarifado_central', label: 'Almoxarifado Central SST' },
  { id: 'outro', label: 'Outro (especificar no motivo)' },
];

export function RequestVehicleForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const vehicleIdFromParams = searchParams.get('vehicleId');
  const vehicleModelFromParams = searchParams.get('vehicleModel');

  const form = useForm<RequestVehicleFormValues>({
    resolver: zodResolver(requestVehicleFormSchema),
    defaultValues: {
      pickupLocation: '',
      destination: '',
      startDate: undefined,
      startTime: '09:00',
      endDate: undefined,
      endTime: '17:00',
      purpose: '',
      photos: undefined,
      vehicleId: vehicleIdFromParams || '',
    },
  });

 useEffect(() => {
    if (vehicleIdFromParams) {
      form.setValue('vehicleId', vehicleIdFromParams);
    }
  }, [vehicleIdFromParams, form]);


  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Limpar previews antigos
    photoPreviews.forEach(url => URL.revokeObjectURL(url));
    setPhotoPreviews([]);

    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setPhotoFiles(filesArray);
      form.setValue('photos', event.target.files, { shouldValidate: true });

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPhotoPreviews(newPreviews);
    } else {
      setPhotoFiles([]);
      form.setValue('photos', undefined, { shouldValidate: true });
    }
  };

  useEffect(() => {
    // Cleanup object URLs on component unmount
    return () => {
      photoPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  async function onSubmit(data: RequestVehicleFormValues) {
    setIsLoading(true);
    console.log('Dados da Solicitação de Veículo:', { ...data, photoFileNames: photoFiles.map(f => f.name) });
    
    // TODO: Adicionar lógica para salvar em IndexedDB se offline
    // Ex: if (!navigator.onLine) { saveToIndexedDB(data); return; }

    try {
      // Simulação de chamada de API
      // Em um cenário real:
      // const formData = new FormData();
      // Object.entries(data).forEach(([key, value]) => {
      //   if (key === 'photos') return; // Handled separately
      //   if (value instanceof Date) formData.append(key, value.toISOString());
      //   else if (value !== undefined) formData.append(key, String(value));
      // });
      // photoFiles.forEach(file => formData.append('photos', file));
      // const response = await fetch('/api/fleet/requests', { method: 'POST', body: formData });
      // if (!response.ok) throw new Error('Falha ao enviar solicitação');
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay da API
    
      toast({
        title: 'Solicitação Enviada!',
        description: `Sua solicitação para ${vehicleModelFromParams ? `o veículo ${vehicleModelFromParams}` : 'um veículo'} foi enviada com sucesso e aguarda aprovação.`,
        className: "bg-green-100 border-green-300 text-green-700 dark:bg-green-700 dark:text-white dark:border-green-900",
      });
      
      setIsLoading(false);
      form.reset({
        pickupLocation: '',
        destination: '',
        startDate: undefined,
        startTime: '09:00',
        endDate: undefined,
        endTime: '17:00',
        purpose: '',
        photos: undefined,
        vehicleId: '', 
      });
      setPhotoFiles([]);
      setPhotoPreviews([]);
      // TODO: Implementar "pulse the vehicle card" - requer comunicação entre componentes ou estado global
      // router.push('/fleet'); // Opcional: Redirecionar

    } catch (error) {
        setIsLoading(false);
        toast({
            variant: "destructive",
            title: "Erro ao Enviar Solicitação",
            description: error instanceof Error ? error.message : "Ocorreu um problema ao enviar sua solicitação."
        });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl animate-fadeInLayout">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Car className="mr-3 h-6 w-6 text-primary" />
          Detalhes da Solicitação de Veículo
        </CardTitle>
        {vehicleModelFromParams && (
          <UiCardDescription>
            Solicitando especificamente o veículo: <strong>{vehicleModelFromParams}</strong> (ID: {vehicleIdFromParams}).
          </UiCardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {form.watch('vehicleId') && (
                <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                    <FormItem hidden>
                        <FormControl>
                        <Input type="hidden" {...field} />
                        </FormControl>
                    </FormItem>
                    )}
                />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" />Local de Partida</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o local de partida" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pickupLocationOptions.map(option => (
                          <SelectItem key={option.id} value={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" />Destino</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Cliente X / Obra Y" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            disabled={isLoading}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || isLoading} initialFocus locale={ptBR} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={isLoading} className="appearance-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Término</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            disabled={isLoading}
                          >
                             <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (form.getValues('startDate') || new Date(new Date().setHours(0,0,0,0))) || isLoading} initialFocus locale={ptBR} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Término</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={isLoading} className="appearance-none"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da Solicitação</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o motivo da necessidade do veículo..." rows={4} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="photos"
                render={({ field }) => ( 
                <FormItem>
                    <FormLabel className="flex items-center">
                        <FileUp className="h-4 w-4 mr-2 text-muted-foreground"/>
                        Anexar Fotos (Opcional)
                    </FormLabel>
                    <FormControl>
                    <Input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        disabled={isLoading}
                        onChange={handlePhotoChange}
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    </FormControl>
                    {photoPreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {photoPreviews.map((url, index) => (
                            <div key={index} className="relative group aspect-square">
                                <img 
                                    src={url} 
                                    alt={`Pré-visualização ${index + 1}`} 
                                    className="object-cover w-full h-full rounded-md border"
                                />
                            </div>
                            ))}
                        </div>
                    )}
                    <UiFormDescription className="text-xs">Anexe fotos relevantes à solicitação (ex: local específico, condição de carga).</UiFormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || !form.formState.isDirty || !form.formState.isValid} 
                className="min-w-[180px] transition-all active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitação'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
