
// src/app/(app)/settings/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, User, Palette, Bell, Languages, Lock } from 'lucide-react';

export default function SettingsPage() {
  return (
    <>
      <PageHeader 
        title="Configurações"
        description="Gerencie as configurações da sua conta e preferências do aplicativo."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              Perfil
            </CardTitle>
            <CardDescription>Atualize suas informações pessoais.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Formulário para editar nome, e-mail (se permitido), foto do perfil e outras informações relevantes.</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5 text-primary" />
              Aparência
            </CardTitle>
            <CardDescription>Personalize o tema do aplicativo.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Opções para alternar entre tema claro e escuro (já implementado via ThemeToggle global) e, futuramente, talvez seleção de cor primária.</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>Gerencie suas preferências de notificação.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Controles para ativar/desativar diferentes tipos de notificações (e-mail, push no app) para alertas, tarefas, etc.</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Languages className="mr-2 h-5 w-5 text-primary" />
              Idioma
            </CardTitle>
            <CardDescription>Selecione o idioma de sua preferência.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Seletores para EN/PT/ES (funcionalidade de i18n a ser totalmente implementada).</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5 text-primary" />
              Segurança
            </CardTitle>
            <CardDescription>Altere sua senha e gerencie o acesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Opção para alterar senha e, para administradores, gerenciar permissões de usuários.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
