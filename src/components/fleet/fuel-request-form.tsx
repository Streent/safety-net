// src/components/fleet/fuel-request-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Check, CloudUpload, Fuel, Car, ListChecks, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const fuelRequestFormSchema = z.object({
  tripId: z.string().min(1, { message: 'Por favor, selecione uma viagem/solicitação.' }),
  liters: z.coerce.number().min(0.1, { message: 'A quantidade de litros deve ser maior que zero.' }),
  fuelType: z.string().min(1, { message: 'Por favor, selecione o tipo de combustível.' }),
  totalValue: z.coerce.number().min(0.01, { message: 'O valor total deve ser maior que zero.' }).optional(),
  odometer: z.coerce.number().min(0, {message: 'Hodômetro não pode ser negativo.'}).optional(),
  fuelingDate: z.date({ required_error: 'A data do abastecimento é obrigatória.' }),
  receiptPhoto: z.any().optional().describe('Foto do recibo de abastecimento (opcional)'),
});

type FuelRequestFormValues = z.infer<typeof fuelRequestFormSchema>;

// Mock data for active trips/requests - replace with actual data source
const mockActiveTrips = [
  { id: 'TRIP001', description: 'Viagem Cliente A - Toyota Hilux (MER1C0S)' },
  { id: 'TRIP002', description: 'Serviço Interno - Fiat Strada (BRA2E19)' },
  { id: 'TRIP003', description: 'Entrega Materiais Obra B - VW Gol (PAU1L0A)' },
];

const fuelTypeOptions = [
  'Gasolina Comum',
  'Gasolina Aditivada',
  'Etanol',
  'Diesel S10',
  'Diesel S500',
  'GNV',
];

export function FuelRequestForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const form = useForm<FuelRequestFormValues>({
    resolver: zodResolver(fuelRequestFormSchema),
    defaultValues: {
      tripId: '',
      liters: undefined,
      fuelType: '',
      totalValue: undefined,
      odometer: undefined,
      fuelingDate: new Date(),
      receiptPhoto: undefined,
    },
  });

  const handleReceiptPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setReceiptFile(event.target.files[0]);
      form.setValue('receiptPhoto', event.target.files[0], { shouldValidate: true });
    } else {
      setReceiptFile(null);
      form.setValue('receiptPhoto', undefined, { shouldValidate: true });
    }
  };

  async function onSubmit(data: FuelRequestFormValues) {
    setIsLoading(true);
    console.log('Dados do Registro de Abastecimento:', { ...data, receiptFileName: receiptFile?.name });
    
    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Abastecimento Registrado!',
      description: `O abastecimento de ${data.liters}L de ${data.fuelType} foi registrado com sucesso.`,
      action: <Button variant="outline" size="sm" onClick={() => router.push('/fleet')}><Check className="mr-2 h-4 w-4" />OK</Button>,
    });
    
    setIsLoading(false);
    form.reset();
    setReceiptFile(null);
    // router.push('/fleet'); // Opcional: Redirecionar após sucesso
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Fuel className="mr-3 h-6 w-6 text-primary" />
          Detalhes do Abastecimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tripId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <ListChecks className="mr-2 h-4 w-4 text-muted-foreground" />
                    Viagem/Solicitação Vinculada
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a viagem/solicitação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockActiveTrips.map(trip => (
                        <SelectItem key={trip.id} value={trip.id}>
                          {trip.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Litros Abastecidos</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 40.5" {...field} step="0.01" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Combustível</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fuelTypeOptions.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="totalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$) (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 200.75" {...field} step="0.01" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="odometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hodômetro (km) (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 123456" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fuelingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Abastecimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          disabled={isLoading}
                        >
                          {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || isLoading} initialFocus locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receiptPhoto"
              render={({ field }) => ( 
                <FormItem>
                  <FormLabel className="flex items-center">
                    <CloudUpload className="h-4 w-4 mr-2 text-muted-foreground"/>
                    Foto do Recibo (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*"
                      disabled={isLoading}
                      onChange={handleReceiptPhotoChange}
                      className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </FormControl>
                  {receiptFile && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Arquivo Selecionado: {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading || !form.formState.isValid} className="min-w-[180px]">
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Abastecimento'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
