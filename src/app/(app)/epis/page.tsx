
// src/app/(app)/epis/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react'; // Example Icon

export default function EpisPage() {
  return (
    <>
      <PageHeader 
        title="EPIs" // i18n: epis.title
        description="Gerenciamento de Equipamentos de Proteção Individual." // i18n: epis.description
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-6 w-6 text-primary" />
            Painel de EPIs {/* i18n: epis.contentTitle */}
          </CardTitle>
          <CardDescription>
            {/* i18n: epis.contentDescription */}
            Esta é a página de espaço reservado para EPIs. Conteúdo em breve!
            Consulte o wireframe para painel de inventário, lista de itens e rastreamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {/* i18n: epis.placeholderText */}
            Painel de inventário, lista de itens, visualização de detalhes e rastreamento de uso serão implementados aqui.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
