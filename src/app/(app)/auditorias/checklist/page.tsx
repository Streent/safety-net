// src/app/(app)/auditorias/checklist/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, ImagePlus, ClipboardCheck, Zap, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuditChecklistPage() {
  return (
    <>
      <PageHeader 
        title="Preencher Checklist de Auditoria"
        description="Siga o assistente passo a passo para completar os itens da auditoria."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ListChecks className="mr-3 h-7 w-7 text-primary" />
            Assistente de Checklist
          </CardTitle>
          <CardDescription>
            Complete cada seção para finalizar a auditoria. Funcionalidades como progresso animado e confirmação de conclusão (com efeito de confetti) serão implementadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary" />
              Wizard Multi-Etapas
            </h3>
            <p className="text-sm text-muted-foreground">
              Um formulário de checklist com múltiplas etapas (ex: Geral, Documentação, Equipamentos) será implementado aqui. Cada item terá opções como Sim/Não/N.A., campo para observações e um botão para anexar fotos.
            </p>
            <div className="mt-2 text-xs text-muted-foreground flex items-center">
                <ImagePlus className="h-3 w-3 mr-1.5 text-muted-foreground"/>
                (Funcionalidade de anexo de fotos por item)
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <ClipboardCheck className="mr-2 h-5 w-5 text-primary" />
              Plano de Ação Pós-Envio
            </h3>
            <p className="text-sm text-muted-foreground">
              Após o envio do checklist preenchido, uma seção para gerar ou visualizar um plano de ação com base nas não conformidades será disponibilizada. As tarefas poderão ser atribuídas a responsáveis.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-primary" />
              Animações e Confirmação
            </h3>
            <p className="text-sm text-muted-foreground">
              Uma barra de progresso animada indicará o avanço no preenchimento. Ao concluir, uma animação de sucesso (como "confetti") e um resumo da auditoria serão exibidos antes do redirecionamento ou da geração do plano de ação.
            </p>
          </div>

           <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline">Salvar Rascunho (Placeholder)</Button>
            <Button>Enviar Checklist (Placeholder)</Button>
           </div>

        </CardContent>
      </Card>
    </>
  );
}
