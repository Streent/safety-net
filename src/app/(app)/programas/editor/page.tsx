// src/app/(app)/programas/editor/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextCursorInput, UploadCloud, ListChecks, Save, Send } from 'lucide-react';

export default function ProgramEditorPage() {
  return (
    <>
      <PageHeader 
        title="Editor de Programa de SST"
        description="Crie ou edite programas de segurança, adicione seções, anexos e checklists."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <TextCursorInput className="mr-3 h-7 w-7 text-primary" />
            Detalhes do Programa
          </CardTitle>
          <CardDescription>
            Preencha as seções do programa, anexe arquivos relevantes e configure checklists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <TextCursorInput className="mr-2 h-5 w-5 text-primary" />
              Editor de Seções (Rich Text)
            </h3>
            <p className="text-sm text-muted-foreground">
              Um editor de texto rico será implementado aqui para criar e formatar as seções do programa (Ex: Introdução, Objetivos, Responsabilidades, Procedimentos). Funcionalidades de expandir/recolher seções com animação de 200ms serão adicionadas.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <UploadCloud className="mr-2 h-5 w-5 text-primary" />
              Anexos e Documentos
            </h3>
            <p className="text-sm text-muted-foreground">
              Uma área para upload e gerenciamento de arquivos anexos (PDFs, planilhas, imagens) relacionados ao programa. Validações de campos obrigatórios serão marcadas.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary" />
              Checklists Integrados
            </h3>
            <p className="text-sm text-muted-foreground">
              Possibilidade de criar ou vincular checklists de auditoria específicos para este programa.
            </p>
          </div>

           <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Save className="mr-2 h-5 w-5 text-primary" />
              Ações
            </h3>
            <p className="text-sm text-muted-foreground">
              Botões para "Salvar Rascunho" e "Publicar Programa" (este último com um modal de confirmação) serão implementados.
            </p>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
