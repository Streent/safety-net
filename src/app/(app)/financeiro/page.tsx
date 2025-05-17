
// src/app/(app)/financeiro/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react'; // Example Icon for Financeiro

export default function FinanceiroPage() {
  return (
    <>
      <PageHeader 
        title="Financeiro" // i18n: financeiro.title
        description="Gerencie despesas e relatórios financeiros." // i18n: financeiro.description
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Landmark className="mr-2 h-6 w-6 text-primary" />
            Painel Financeiro {/* i18n: financeiro.contentTitle */}
          </CardTitle>
          <CardDescription>
            {/* i18n: financeiro.contentDescription */}
            Esta é a página de espaço reservado para o Financeiro. Conteúdo em breve!
            Consulte o wireframe para solicitações de despesas e relatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {/* i18n: financeiro.placeholderText */}
            Formulário de solicitação de despesas, lista com status, botões de aprovação/rejeição e exportação de relatórios serão implementados aqui.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
