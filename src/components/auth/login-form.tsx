
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
import { Loader2, Sun, Moon } from 'lucide-react'; // Importar Loader2, Sun, Moon
import { ThemeToggle } from '@/components/layout/theme-toggle'; // Re-using existing toggle

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um endereço de e-mail válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showSplash, setShowSplash] = useState(true);
  const { login, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark'); // Assuming default dark for login

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    // Attempt to get theme from localStorage or default to dark
    const storedTheme = localStorage.getItem('safetynet-theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setCurrentTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark'); // Default to dark if nothing stored
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500); // Duração do splash screen (1.5 segundos)
    return () => clearTimeout(timer);
  }, []);

  const toggleThemeInternal = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('safetynet-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };


  async function onSubmit(data: LoginFormValues) {
    try {
      await login(data.email, data.password);
      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo de volta!',
      });
      // router.push('/dashboard'); // useAuth hook já faz o redirecionamento
    } catch (error) {
      console.error("Falha no Login:", error);
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
        {/* Simple "moving a little" animation: pulse */}
        <div className="animate-pulse">
          <Logo className="w-48 h-auto mb-2" />
        </div>
        <p className="text-sm text-muted-foreground">GESTÃO | CONSULTORIA | TREINAMENTO</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 text-foreground">
      {/* Language and Theme Toggles at the top */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          {/* Placeholder Flags - Non-functional */}
          <Button variant="ghost" size="sm" disabled={authLoading} className="opacity-50 cursor-not-allowed" title="English (Placeholder)">EN</Button>
          <Button variant="ghost" size="sm" disabled={authLoading} className="font-semibold text-yellow-400 cursor-not-allowed" title="Português (Atual - Placeholder)">PT</Button>
          <Button variant="ghost" size="sm" disabled={authLoading} className="opacity-50 cursor-not-allowed" title="Español (Placeholder)">ES</Button>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleThemeInternal} aria-label={currentTheme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'} disabled={authLoading}>
            {currentTheme === 'dark' ? <Sun className="h-5 w-5 text-gray-400 hover:text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-400 hover:text-yellow-400" />}
        </Button>
      </div>
      
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <Logo className="w-40 sm:w-48 h-auto mb-1" />
        <p className="text-xs text-muted-foreground mb-6">GESTÃO | CONSULTORIA | TREINAMENTO</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-1 sm:mt-2">
          Entre com suas credenciais para acessar o sistema
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
            data-ai-hint="endereço de email"
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
            data-ai-hint="senha"
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <Checkbox 
            id="rememberMe" 
            {...form.register('rememberMe')} 
            className="data-[state=checked]:bg-yellow-400 data-[state=checked]:text-black border-yellow-400 focus:ring-yellow-400"
            disabled={authLoading}
          />
          <Label htmlFor="rememberMe" className="text-sm font-normal text-gray-300 cursor-pointer">Lembrar-me</Label>
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
            'Entrar'
          )}
        </Button>
      </form>

      <Button variant="link" className="w-full text-gray-400 hover:text-yellow-400 text-sm">
        Ou acesse em modo offline
      </Button>

      <p className="mt-8 text-center text-xs text-gray-500">
        SafetyNet © 2025 - Gestão | Consultoria | Treinamento
      </p>
    </div>
  );
}
