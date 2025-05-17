
// src/app/(app)/biblioteca/page.tsx
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Library } from 'lucide-react'; // Example Icon

export default function BibliotecaPage() {
  return (
    <>
      <PageHeader 
        title="Biblioteca" // i18n: biblioteca.title
        description="Acesse documentos, vídeos e outros materiais." // i18n: biblioteca.description
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Library className="mr-2 h-6 w-6 text-primary" />
            Recursos da Biblioteca {/* i18n: biblioteca.contentTitle */}
          </CardTitle>
          <CardDescription>
            {/* i18n: biblioteca.contentDescription */}
            Esta é a página de espaço reservado para a Biblioteca. Conteúdo em breve!
            Consulte o wireframe para busca, categorias e visualizador de conteúdo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {/* i18n: biblioteca.placeholderText */}
            Barra de busca, blocos de categoria, visualizador de conteúdo e funcionalidade de upload (admin) serão implementados aqui.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
