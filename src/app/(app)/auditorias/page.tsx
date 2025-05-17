
// src/app/(app)/auditorias/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSearch, ListChecks, Edit3, History, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuditoriasPage() {
  return (
    <>
      <PageHeader 
        title="Auditorias de Segurança"
        description="Planeje, execute e acompanhe auditorias de SST."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Auditoria
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <FileSearch className="mr-3 h-7 w-7 text-primary" />
            Gestão de Auditorias
          </CardTitle>
          <CardDescription>
            Crie novas auditorias, preencha checklists e gerencie ações corretivas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary" />
              Lista de Auditorias
            </h3>
            <p className="text-sm text-muted-foreground">
              Uma lista/tabela de auditorias agendadas e concluídas será exibida aqui, com status e datas. O botão "Nova Auditoria" acima iniciará o processo de criação.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary" /> {/* Reutilizando ListChecks para clareza */}
              Wizard de Checklist Multi-etapas
            </h3>
            <p className="text-sm text-muted-foreground">
              Um assistente (wizard) para preenchimento de checklists de auditoria com múltiplas etapas será implementado.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Edit3 className="mr-2 h-5 w-5 text-primary" />
              Painel de Ações Corretivas
            </h3>
            <p className="text-sm text-muted-foreground">
              Um painel para gerenciar ações corretivas identificadas nas auditorias, com funcionalidade de arrastar e soltar (drag/drop) para atualizar status, será implementado.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <History className="mr-2 h-5 w-5 text-primary" />
              Histórico e Versionamento
            </h3>
            <p className="text-sm text-muted-foreground">
              Funcionalidades para rastrear o histórico de auditorias e o versionamento de checklists serão incluídas.
            </p>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
