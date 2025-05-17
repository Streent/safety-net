
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
import { Loader2, Fingerprint, Sun, Moon } from 'lucide-react'; // Adicionado Fingerprint

const clientLoginSchema = z.object({
  emailOrCnpj: z.string().min(1, { message: 'Por favor, insira um e-mail ou CNPJ válido.' }), // Alterado para aceitar email ou CNPJ no label
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

type ClientLoginFormValues = z.infer<typeof clientLoginSchema>;

export function ClientPortalLoginForm() {
  const { login, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showSplash, setShowSplash] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark'); // Assumindo escuro como padrão

  const form = useForm<ClientLoginFormValues>({
    resolver: zodResolver(clientLoginSchema),
    defaultValues: {
      emailOrCnpj: '',
      password: '',
    },
  });

  useEffect(() => {
    // Tenta obter o tema do localStorage ou usa 'dark' como padrão
    const storedTheme = localStorage.getItem('safetynet-portal-theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setCurrentTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark'); // Padrão para escuro se nada armazenado
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Duração do splash screen (3 segundos)
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
      // Para a lógica de login, ainda usaremos o campo como 'email' para o useAuth,
      // mas o usuário pode digitar email ou CNPJ.
      await login(data.emailOrCnpj, data.password);
      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo ao Portal do Cliente!',
      });
      // Idealmente, redirecionar para /portal/dashboard
      // router.push('/portal/dashboard'); // useAuth atualmente redireciona para /dashboard
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
      <div className="flex flex-col items-center justify-center min-h-screen animate-fadeInLayout">
        {/* Animação de fade e scale para o logo */}
        <div className="animate-in fade-in zoom-in-50 duration-1000">
          <Logo className="w-52 h-auto mb-3" />
        </div>
        <p className="text-sm text-muted-foreground">Carregando Portal do Cliente...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 text-foreground animate-fadeInLayout">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-1">
          {/* Placeholder para seletores de idioma */}
          <Button variant="ghost" size="sm" disabled={authLoading} className="text-xs opacity-70" title="English (Placeholder)">EN</Button>
          <Button variant="ghost" size="sm" disabled={authLoading} className="text-xs font-semibold text-yellow-400" title="Português (Atual)">PT</Button>
          <Button variant="ghost" size="sm" disabled={authLoading} className="text-xs opacity-70" title="Español (Placeholder)">ES</Button>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleThemeInternal} aria-label={currentTheme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'} disabled={authLoading}>
            {currentTheme === 'dark' ? <Sun className="h-5 w-5 text-gray-400 hover:text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-400 hover:text-yellow-400" />}
        </Button>
      </div>

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
          <Label htmlFor="emailOrCnpj">Email / CNPJ</Label>
          <Input
            id="emailOrCnpj"
            type="text" // Alterado para text para aceitar CNPJ, validação de email ainda no Zod.
            placeholder="seu@email.com ou CNPJ"
            {...form.register('emailOrCnpj')}
            disabled={authLoading}
            className="bg-gray-800 border-gray-700 placeholder-gray-500 focus:ring-yellow-400 focus:border-yellow-400"
            data-ai-hint="email ou CNPJ do cliente"
          />
          {form.formState.errors.emailOrCnpj && (
            <p className="text-xs text-red-400">{form.formState.errors.emailOrCnpj.message}</p>
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

        {/* Dica Biométrica - Visível apenas em mobile (placeholder) */}
        <div className="sm:hidden flex items-center text-xs text-gray-400 mt-2">
          <Fingerprint className="h-4 w-4 mr-1.5" />
          <span>Use sua impressão digital para entrar (placeholder).</span>
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

