
'use client';
import { useState, useEffect } from 'react';
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
import { Loader2, Fingerprint, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

const clientLoginSchema = z.object({
  // Accepts email or a string that might represent CNPJ (min 1 char).
  // More specific CNPJ validation can be added if needed.
  emailOrCnpj: z.string().min(1, { message: 'Por favor, insira seu e-mail ou CNPJ.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

type ClientLoginFormValues = z.infer<typeof clientLoginSchema>;

export function ClientPortalLoginForm() {
  const { login, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showSplash, setShowSplash] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  const form = useForm<ClientLoginFormValues>({
    resolver: zodResolver(clientLoginSchema),
    defaultValues: {
      emailOrCnpj: '',
      password: '',
    },
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem('safetynet-portal-theme') as 'light' | 'dark' | null;
    const initialTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setCurrentTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    
    // Clear main app theme to avoid conflicts if user switches between portals
    localStorage.removeItem('safetynet-theme');


    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Splash screen duration (2 seconds)
    return () => clearTimeout(timer);
  }, []);

  const toggleThemeInternal = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('safetynet-portal-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  async function onSubmit(data: ClientLoginFormValues) {
    try {
      await login(data.emailOrCnpj, data.password);
      // useAuth hook now handles redirection based on profile
      toast({
        title: 'Login bem-sucedido!',
        description: 'Bem-vindo(a) ao Portal do Cliente SafetyNet.',
      });
    } catch (error) {
      console.error("Falha no Login do Portal:", error);
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: (error as Error).message || 'Credenciais inválidas. Por favor, tente novamente.',
      });
    }
  }

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen animate-fadeInLayout bg-background text-foreground">
        <div className="animate-in fade-in zoom-in-75 duration-1000">
          <Logo className="w-52 h-auto mb-3" />
        </div>
        <p className="text-sm text-muted-foreground mt-2">Carregando Portal do Cliente SafetyNet...</p>
        <Loader2 className="animate-spin mt-4 h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 text-foreground animate-fadeInLayout", currentTheme === 'dark' ? 'bg-slate-900' : 'bg-slate-50' )}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" disabled={authLoading} className="text-xs opacity-70 hover:bg-slate-700" title="English (Placeholder)">EN</Button>
          <Button variant="ghost" size="sm" disabled={authLoading} className="text-xs font-semibold text-primary hover:bg-slate-700" title="Português (Atual)">PT</Button>
          <Button variant="ghost" size="sm" disabled={authLoading} className="text-xs opacity-70 hover:bg-slate-700" title="Español (Placeholder)">ES</Button>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleThemeInternal} aria-label={currentTheme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'} disabled={authLoading} className="hover:bg-slate-700">
            {currentTheme === 'dark' ? <Sun className="h-5 w-5 text-gray-400 hover:text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600 hover:text-slate-800" />}
        </Button>
      </div>

      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <Logo className="w-40 sm:w-48 h-auto mb-2" />
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center mt-4">
          Portal do Cliente
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-1 sm:mt-2">
          Acesse suas informações e documentos de segurança.
        </p>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="emailOrCnpj" className={cn(currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>Email / CNPJ</Label>
          <Input
            id="emailOrCnpj"
            type="text"
            placeholder="seu@email.com ou CNPJ da empresa"
            {...form.register('emailOrCnpj')}
            disabled={authLoading}
            className={cn("focus:ring-primary focus:border-primary", currentTheme === 'dark' ? "bg-slate-800 border-slate-700 placeholder-slate-500" : "bg-white border-slate-300 placeholder-slate-400" )}
            data-ai-hint="email ou CNPJ do cliente"
          />
          {form.formState.errors.emailOrCnpj && (
            <p className="text-xs text-red-500 dark:text-red-400">{form.formState.errors.emailOrCnpj.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className={cn(currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>Senha</Label>
            <Link href="#" className="text-xs text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            disabled={authLoading}
            className={cn("focus:ring-primary focus:border-primary", currentTheme === 'dark' ? "bg-slate-800 border-slate-700 placeholder-slate-500" : "bg-white border-slate-300 placeholder-slate-400" )}
            {...form.register('password')}
            data-ai-hint="senha do cliente"
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-500 dark:text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="sm:hidden flex items-center text-xs text-muted-foreground mt-2">
          <Fingerprint className="h-4 w-4 mr-1.5" />
          <span className={cn(currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>Use sua impressão digital para entrar (placeholder).</span>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg py-2.5 sm:py-3 font-semibold" 
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

      <p className={cn("mt-8 text-center text-xs", currentTheme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>
        SafetyNet © {new Date().getFullYear()}
      </p>
    </div>
  );
}
