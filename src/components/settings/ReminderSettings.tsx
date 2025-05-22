
// src/components/settings/ReminderSettings.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Smartphone, MessageSquareText, Mail, Loader2, BellRing } from 'lucide-react';
import type { ReminderSettingsPayload } from '@/app/api/reminderSettings/route';

// Schema for contact validation
const contactFormSchema = z.object({
  phone: z.string().optional(), // Simplified for now, can add regex for phone
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }).optional(),
});
type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ReminderChannel {
  id: 'whatsapp' | 'sms' | 'email';
  label: string;
  icon: React.ElementType;
  contactField: keyof ContactFormValues;
  placeholder: string;
}

const reminderChannels: ReminderChannel[] = [
  { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone, contactField: 'phone', placeholder: 'Seu nº de WhatsApp (Ex: 55119...)' },
  { id: 'sms', label: 'SMS', icon: MessageSquareText, contactField: 'phone', placeholder: 'Seu nº de Celular para SMS' },
  { id: 'email', label: 'E-mail', icon: Mail, contactField: 'email', placeholder: 'Seu endereço de e-mail' },
];

export function ReminderSettings() {
  const { toast } = useToast();
  const [channelSettings, setChannelSettings] = React.useState<Record<ReminderChannel['id'], boolean>>({
    whatsapp: true,
    sms: false,
    email: true,
  });
  const [loadingStates, setLoadingStates] = React.useState<Record<ReminderChannel['id'], boolean>>({
    whatsapp: false,
    sms: false,
    email: false,
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      phone: '',
      email: '',
    },
  });

  React.useEffect(() => {
    // In a real app, fetch initial settings from /api/reminderSettings
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/reminderSettings');
            if (response.ok) {
                const data: ReminderSettingsPayload = await response.json();
                setChannelSettings(prev => ({
                    ...prev,
                    whatsapp: data.whatsappEnabled ?? prev.whatsapp,
                    sms: data.smsEnabled ?? prev.sms,
                    email: data.emailEnabled ?? prev.email,
                }));
            }
        } catch (error) {
            console.error("Failed to fetch initial reminder settings", error);
        }
    };
    fetchSettings();
  }, []);

  const handleToggleChange = async (channelId: ReminderChannel['id'], enabled: boolean) => {
    const newSettings = { ...channelSettings, [channelId]: enabled };
    setChannelSettings(newSettings);

    try {
      const response = await fetch('/api/reminderSettings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [`${channelId}Enabled`]: enabled,
        } as ReminderSettingsPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Falha ao atualizar configuração.' }));
        throw new Error(errorData.error);
      }
      // toast({ title: 'Sucesso', description: `Configuração de ${channelId} atualizada.` });
    } catch (error) {
      console.error(`Failed to save ${channelId} setting:`, error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: (error as Error).message || `Não foi possível atualizar a configuração de ${channelId}.`,
      });
      // Revert UI on error
      setChannelSettings(prev => ({ ...prev, [channelId]: !enabled }));
    }
  };

  const handleSendTest = async (channel: ReminderChannel) => {
    let contactValue: string | undefined;
    if (channel.contactField === 'phone') {
      contactValue = form.getValues('phone');
      if (!contactValue) {
        form.setError('phone', { type: 'manual', message: 'Número de telefone é obrigatório para este teste.' });
        return;
      } else {
        form.clearErrors('phone');
      }
    } else if (channel.contactField === 'email') {
      contactValue = form.getValues('email');
      const emailValidation = z.string().email().safeParse(contactValue);
      if (!emailValidation.success) {
         form.setError('email', { type: 'manual', message: 'E-mail inválido para este teste.' });
        return;
      } else {
        form.clearErrors('email');
      }
    }

    if (!contactValue) return; // Should be caught by above validation

    setLoadingStates(prev => ({ ...prev, [channel.id]: true }));

    try {
      const response = await fetch('/api/testReminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: channel.id, contact: contactValue }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar lembrete de teste.');
      }
      toast({ title: 'Teste Enviado!', description: data.message });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha no Teste',
        description: (error as Error).message,
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [channel.id]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BellRing className="mr-2 h-5 w-5 text-primary" />
          Configurações de Lembretes
        </CardTitle>
        <CardDescription>
          Gerencie os canais de notificação para lembretes e alertas importantes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <Form {...form}>
          <form className="space-y-6"> {/* No onSubmit needed at form level, handled by buttons */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Telefone (para WhatsApp/SMS)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 55119xxxxxxxx" {...field} />
                    </FormControl>
                    <FormDescription>Usado para enviar testes via WhatsApp e SMS.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço de E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                     <FormDescription>Usado para enviar testes via E-mail.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <div className="space-y-6">
          {reminderChannels.map((channel) => (
            <div
              key={channel.id}
              className="grid grid-cols-1 items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 md:grid-cols-[1fr_auto_auto] md:gap-6"
              data-testid={`channel-item-${channel.id}`}
            >
              <div className="flex items-center space-x-3">
                <channel.icon className="h-6 w-6 text-muted-foreground" />
                <Label htmlFor={`toggle-${channel.id}`} className="text-base font-medium">
                  {channel.label}
                </Label>
              </div>
              <div className="flex items-center justify-start space-x-2 md:justify-center">
                 <Switch
                    id={`toggle-${channel.id}`}
                    checked={channelSettings[channel.id]}
                    onCheckedChange={(checked) => handleToggleChange(channel.id, checked)}
                    aria-label={`Ativar/desativar lembretes por ${channel.label}`}
                  />
                 <span className="text-sm text-muted-foreground">
                    {channelSettings[channel.id] ? 'Ativado' : 'Desativado'}
                 </span>
              </div>
              <Button
                onClick={() => handleSendTest(channel)}
                variant="outline"
                size="sm"
                disabled={loadingStates[channel.id]}
                className="w-full md:w-auto"
              >
                {loadingStates[channel.id] ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Testar Lembrete
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
