
// src/app/(app)/settings/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, User, Palette, Bell, Languages, Lock, UsersRound, MapPinned, PackageSearch } from 'lucide-react';
import { ReminderSettings } from '@/components/settings/ReminderSettings'; 
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <>
      <PageHeader 
        title="Configurações"
        description="Gerencie as configurações da sua conta, preferências do aplicativo e integrações."
      />
      <div className="space-y-8">
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                Perfil e Conta
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <h3 className="text-lg font-medium mb-1">Informações Pessoais</h3>
                        <p className="text-sm text-muted-foreground mb-3">Formulário para editar nome, e-mail (se permitido), foto do perfil.</p>
                        <Button variant="outline" size="sm">Editar Perfil (Placeholder)</Button>
                    </div>
                     <div>
                        <h3 className="text-lg font-medium mb-1">Segurança da Conta</h3>
                        <p className="text-sm text-muted-foreground mb-3">Altere sua senha e gerencie o acesso.</p>
                        <Button variant="outline" size="sm">Alterar Senha (Placeholder)</Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <ReminderSettings />

        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Palette className="mr-2 h-5 w-5 text-primary" />
                    Aparência e Idioma
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <h3 className="text-lg font-medium mb-1">Tema</h3>
                        <p className="text-sm text-muted-foreground">Personalize o tema do aplicativo (claro/escuro). O seletor global já está funcional.</p>
                    </div>
                     <div>
                        <h3 className="text-lg font-medium mb-1">Idioma</h3>
                        <p className="text-sm text-muted-foreground">Selecione o idioma de sua preferência (funcionalidade de i18n a ser implementada).</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Lock className="mr-2 h-5 w-5 text-primary" />
                    Administração do Sistema (Placeholders)
                </CardTitle>
                <CardDescription>Acesso restrito para administradores.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-medium mb-1 flex items-center"><UsersRound className="mr-2 h-4 w-4 text-muted-foreground"/>Usuários e Permissões</h3>
                    <p className="text-xs text-muted-foreground">Gerenciar usuários e seus níveis de acesso.</p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-medium mb-1 flex items-center"><MapPinned className="mr-2 h-4 w-4 text-muted-foreground"/>Locais e Setores</h3>
                    <p className="text-xs text-muted-foreground">Cadastrar e configurar locais de armazenamento e setores da empresa.</p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-medium mb-1 flex items-center"><PackageSearch className="mr-2 h-4 w-4 text-muted-foreground"/>Tipos de EPIs</h3>
                    <p className="text-xs text-muted-foreground">Configurar categorias e tipos padrão de EPIs.</p>
                </div>
            </CardContent>
        </Card>

      </div>
    </>
  );
}
