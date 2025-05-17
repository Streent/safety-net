
// src/app/(app)/campanhas/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react'; // Example Icon

export default function CampanhasPage() {
  return (
    <>
      <PageHeader 
        title="Campanhas" // i18n: campanhas.title
        description="Crie e gerencie campanhas de segurança." // i18n: campanhas.description
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Megaphone className="mr-2 h-6 w-6 text-primary" />
            Gerenciador de Campanhas {/* i18n: campanhas.contentTitle */}
          </CardTitle>
          <CardDescription>
            {/* i18n: campanhas.contentDescription */}
            Esta é a página de espaço reservado para Campanhas. Conteúdo em breve!
            Consulte o wireframe para lista de campanhas, detalhes e edição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {/* i18n: campanhas.placeholderText */}
            Lista de campanhas, editor de rich text, galeria de mídia e funcionalidade de envio serão implementados aqui.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
