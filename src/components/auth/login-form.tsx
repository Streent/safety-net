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
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Github, Mail, ShieldCheck } from 'lucide-react'; // ShieldCheck for a generic auth provider
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showSplash, setShowSplash] = useState(true);
  const { login, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // 2 seconds splash screen
    return () => clearTimeout(timer);
  }, []);

  async function onSubmit(data: LoginFormValues) {
    try {
      await login(data.email, data.password);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!', // i18n: login.successToast
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: 'destructive',
        title: 'Login Failed', // i18n: login.failToastTitle
        description: (error as Error).message || 'Invalid credentials. Please try again.', // i18n: login.failToastDescription
      });
    }
  }
  
  // Language switcher placeholder
  const LanguageSwitcher = () => (
    <div className="flex items-center space-x-2 text-sm">
      {/* i18n: language.en, language.pt, language.es */}
      <Button variant="ghost" size="sm">EN</Button>
      <Separator orientation="vertical" className="h-4"/>
      <Button variant="ghost" size="sm">PT</Button>
      <Separator orientation="vertical" className="h-4"/>
      <Button variant="ghost" size="sm">ES</Button>
    </div>
  );


  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen animate-fadeIn">
        <Logo className="w-48 h-auto mb-4" />
        <p className="text-xl font-semibold text-primary">SafetyNet</p> {/* i18n: app.name */}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-card shadow-xl rounded-lg">
      <div className="flex flex-col items-center">
        <Logo className="w-36 h-auto mb-6" />
        <h1 className="text-2xl font-bold tracking-tight text-center text-foreground">
          {/* i18n: login.title */}
          Welcome to SafetyNet
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          {/* i18n: login.subtitle */}
          Securely access your safety dashboard.
        </p>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">{/* i18n: login.emailLabel */}Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...form.register('email')}
            disabled={authLoading}
            data-ai-hint="email address"
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{/* i18n: login.passwordLabel */}Password</Label>
            <Link href="#" className="text-xs text-primary hover:underline">
              {/* i18n: login.forgotPasswordLink */}
              Forgot Password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...form.register('password')}
            disabled={authLoading}
            data-ai-hint="password"
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={authLoading}>
          {authLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {/* i18n: login.loggingInButton */}
              Logging in...
            </>
          ) : (
            // i18n: login.loginButton
            'Log In'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            {/* i18n: login.orContinueWith */}
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="w-full" disabled={authLoading}>
          <Mail className="mr-2 h-4 w-4" /> {/* i18n: login.googleButton */} Google (Placeholder)
        </Button>
        <Button variant="outline" className="w-full" disabled={authLoading}>
          <Github className="mr-2 h-4 w-4" /> {/* i18n: login.githubButton */} GitHub (Placeholder)
        </Button>
      </div>

      <Separator />

      <div className="flex items-center justify-between pt-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
       <p className="text-center text-xs text-muted-foreground">
        {/* i18n: login.noAccountPrompt */}
        Don't have an account?{' '}
        <Link href="#" className="font-medium text-primary hover:underline">
          {/* i18n: login.signUpLink */}
          Sign Up
        </Link>
      </p>
    </div>
  );
}
