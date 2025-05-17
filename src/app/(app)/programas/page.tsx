
// src/app/(app)/programas/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Edit, FileCheck, Download } from 'lucide-react';

export default function ProgramasPage() {
  return (
    <>
      <PageHeader 
        title="Programas de SST"
        description="Gerencie programas como PGR, PCMSO, LTCAT e PPP."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ClipboardList className="mr-3 h-7 w-7 text-primary" />
            Gerenciamento de Programas
          </CardTitle>
          <CardDescription>
            Visualize, edite e acompanhe os programas de segurança e saúde no trabalho.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-primary" />
              Lista de Programas
            </h3>
            <p className="text-sm text-muted-foreground">
              Uma lista/tabela de programas (PGR, PCMSO, LTCAT, PPP) será exibida aqui, com opções para visualizar e editar cada um.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Edit className="mr-2 h-5 w-5 text-primary" />
              Editor de Programas
            </h3>
            <p className="text-sm text-muted-foreground">
              Um editor de rich-text para as seções de cada programa, com funcionalidade para anexar arquivos e selecionar versões (dropdown), será implementado aqui.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-primary" />
              Checklists de Auditoria para Programas
            </h3>
            <p className="text-sm text-muted-foreground">
              Funcionalidade para checklists de auditoria multi-etapas, com opção para anexar evidências fotográficas, será integrada aos programas.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Download className="mr-2 h-5 w-5 text-primary" />
              Exportação
            </h3>
            <p className="text-sm text-muted-foreground">
              Opções para exportar os programas em formatos PDF e PPTX serão disponibilizadas.
            </p>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
