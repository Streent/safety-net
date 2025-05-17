
// src/app/(app)/financeiro/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, FileText, DollarSign, CheckCircle, XCircle, Download } from 'lucide-react'; // Example Icons
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FinanceiroPage() {
  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Gerencie despesas, visualize solicitações e exporte relatórios financeiros."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Landmark className="mr-3 h-7 w-7 text-primary" />
            Painel Financeiro
          </CardTitle>
          <CardDescription>
            Acompanhe as solicitações de despesas e acesse os relatórios financeiros.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-primary" />
              Solicitações de Despesas
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              Um formulário para novas solicitações será implementado aqui, incluindo campos para: tipo de despesa, valor, data, descrição e upload de comprovante.
            </p>
            <p className="text-sm text-muted-foreground">
              Abaixo do formulário, uma lista de solicitações será exibida com status (Ex: <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-700 border-yellow-500/30">Pendente</Badge>, <Badge variant="outline" className="text-xs bg-green-500/20 text-green-700 border-green-500/30">Aprovado</Badge>, <Badge variant="outline" className="text-xs bg-red-500/20 text-red-700 border-red-500/30">Rejeitado</Badge>). Usuários com perfil "financeiro" terão botões para <Button variant="ghost" size="xs" className="text-green-600 p-1 h-auto"><CheckCircle className="h-4 w-4 mr-1"/>Aprovar</Button> e <Button variant="ghost" size="xs" className="text-red-600 p-1 h-auto"><XCircle className="h-4 w-4 mr-1"/>Rejeitar</Button>.
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Relatórios Financeiros
            </h3>
            <p className="text-sm text-muted-foreground">
              Uma aba ou seção de "Relatórios" será implementada, permitindo a exportação de dados financeiros em formatos como <Button variant="outline" size="xs" className="p-1 h-auto"><Download className="h-4 w-4 mr-1"/>CSV</Button> e <Button variant="outline" size="xs" className="p-1 h-auto"><Download className="h-4 w-4 mr-1"/>PDF</Button>.
            </p>
          </div>

        </CardContent>
      </Card>
    </>
  );
}
