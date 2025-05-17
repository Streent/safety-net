
'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/common/logo';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const clientLoginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um endereço de e-mail válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

type ClientLoginFormValues = z.infer<typeof clientLoginSchema>;

export function ClientPortalLoginForm() {
  const { login, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<ClientLoginFormValues>({
    resolver: zodResolver(clientLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: ClientLoginFormValues) {
    try {
      // Em uma aplicação real, você pode ter uma lógica de login diferente para clientes
      // ou verificar um 'perfil' de cliente.
      await login(data.email, data.password);
      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo ao Portal do Cliente!',
      });
      // Redirecionar para o dashboard do portal do cliente (ex: /portal/dashboard)
      // router.push('/portal/dashboard'); // useAuth já redireciona para /dashboard por enquanto
    } catch (error) {
      console.error("Falha no Login do Portal:", error);
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: (error as Error).message || 'Credenciais inválidas. Por favor, tente novamente.',
      });
    }
  }

  return (
    <div className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 text-foreground">
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <Logo className="w-40 sm:w-48 h-auto mb-2" />
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center mt-4">
          Portal do Cliente
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-1 sm:mt-2">
          Acesse suas informações e documentos.
        </p>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...form.register('email')}
            disabled={authLoading}
            className="bg-gray-800 border-gray-700 placeholder-gray-500 focus:ring-yellow-400 focus:border-yellow-400"
            data-ai-hint="email do cliente"
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="#" className="text-xs text-yellow-400 hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            disabled={authLoading}
            className="bg-gray-800 border-gray-700 placeholder-gray-500 focus:ring-yellow-400 focus:border-yellow-400"
            {...form.register('password')}
            data-ai-hint="senha do cliente"
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-base sm:text-lg py-2.5 sm:py-3 font-semibold" 
          disabled={authLoading}
        >
          {authLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Entrando...
            </>
          ) : (
            'Entrar no Portal'
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-gray-500">
        SafetyNet © {new Date().getFullYear()}
      </p>
    </div>
  );
}
