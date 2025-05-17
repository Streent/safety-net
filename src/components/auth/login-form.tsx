
'use client';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/common/logo';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um endereço de e-mail válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }), // Min 1 to ensure it's not empty
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showSplash, setShowSplash] = useState(true); // Splash screen can be kept or removed based on final preference
  const { login, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    // If you want to keep the splash, keep this. Otherwise, remove and set setShowSplash(false) directly.
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000); // Shortened splash for quicker development, adjust as needed
    return () => clearTimeout(timer);
  }, []);

  async function onSubmit(data: LoginFormValues) {
    try {
      await login(data.email, data.password);
      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo de volta!',
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: (error as Error).message || 'Credenciais inválidas. Por favor, tente novamente.',
      });
    }
  }

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen animate-fadeIn">
        <Logo className="w-48 h-auto mb-2" />
        <p className="text-sm text-muted-foreground">GESTÃO | CONSULTORIA | TREINAMENTO</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 text-foreground">
      <div className="flex flex-col items-center">
        <Logo className="w-56 h-auto mb-2" /> {/* Adjusted size */}
        <p className="text-xs text-muted-foreground mb-8">GESTÃO | CONSULTORIA | TREINAMENTO</p>
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Entre com suas credenciais para acessar o sistema
        </p>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...form.register('email')}
            disabled={authLoading}
            className="bg-gray-800 border-gray-700 placeholder-gray-500"
            data-ai-hint="email address"
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
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
            className="bg-gray-800 border-gray-700 placeholder-gray-500"
            {...form.register('password')}
            data-ai-hint="password"
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="rememberMe" 
              {...form.register('rememberMe')} 
              className="data-[state=checked]:bg-yellow-400 data-[state=checked]:text-black border-yellow-400"
              disabled={authLoading}
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal text-gray-300">Lembrar-me</Label>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-lg py-3" 
          disabled={authLoading}
        >
          {authLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      <Button variant="link" className="w-full text-gray-400 hover:text-yellow-400">
        Ou acesse em modo offline
      </Button>

      <p className="mt-12 text-center text-xs text-gray-500">
        Safety Solutions © 2025 - Gestão | Consultoria | Treinamento
      </p>
    </div>
  );
}
