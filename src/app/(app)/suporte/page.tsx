
// src/app/(app)/suporte/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, MessageSquarePlus, Ticket, ListChecks } from 'lucide-react'; // Example Icons

export default function SuportePage() {
  return (
    <>
      <PageHeader
        title="Suporte Técnico"
        description="Crie e acompanhe seus tickets de suporte ou fale com nosso assistente."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Ticket className="mr-3 h-7 w-7 text-primary" />
              Novo Ticket de Suporte
            </CardTitle>
            <CardDescription>
              Descreva seu problema ou dúvida para que nossa equipe possa ajudar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <MessageSquarePlus className="mr-2 h-5 w-5 text-primary" />
                Formulário de Criação
              </h3>
              <p className="text-sm text-muted-foreground">
                Um formulário será implementado aqui com campos para: Categoria (Ex: Dúvida, Problema Técnico, Sugestão), Prioridade (Baixa, Média, Alta), Descrição detalhada e opção para Anexos (prints, logs, etc.).
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ListChecks className="mr-3 h-7 w-7 text-primary" />
              Meus Tickets
            </CardTitle>
            <CardDescription>
              Acompanhe o status dos seus tickets abertos e o histórico dos resolvidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-semibold mb-2">
                Lista de Tickets
              </h3>
              <p className="text-sm text-muted-foreground">
                Uma lista/tabela será implementada aqui exibindo: ID do Ticket, Status (Aberto, Em Andamento, Resolvido, Fechado), Data da Última Atualização e Agente Responsável (se aplicável).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <LifeBuoy className="mr-3 h-7 w-7 text-accent" />
            Assistente Virtual (Chat)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Para respostas rápidas, nosso chat com assistente virtual (IA) estará disponível aqui. Esta funcionalidade já está parcialmente implementada com o botão flutuante no canto da tela.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
