// src/app/(app)/certificados/novo/page.tsx
'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, Users, Link as LinkIcon, Calendar, Building, AlertTriangle } from 'lucide-react'; // Renomeado Link para LinkIcon

export default function NewCertificatePage() {
  // Placeholder para o formulário de emissão de certificado
  // No futuro, aqui teremos um formulário com react-hook-form e Zod para validação.

  return (
    <>
      <PageHeader
        title="Emitir Novo Certificado"
        description="Preencha os dados abaixo para gerar um novo certificado de treinamento."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <FileText className="mr-3 h-7 w-7 text-primary" />
            Formulário de Emissão de Certificado
          </CardTitle>
          <CardDescription>
            Todos os campos marcados com * são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              Dados do Aluno
            </h3>
            <p className="text-sm text-muted-foreground italic">
              (Placeholder: Campos para Nome Completo, CPF, E-mail)
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <LinkIcon className="mr-2 h-5 w-5 text-primary" /> {/* Usando LinkIcon */}
              Dados do Treinamento
            </h3>
            <p className="text-sm text-muted-foreground italic">
              (Placeholder: Campos para Nome do Curso/NR, Data de Realização, Local, Instrutor Responsável)
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Building className="mr-2 h-5 w-5 text-primary" />
              Dados da Empresa (Opcional)
            </h3>
            <p className="text-sm text-muted-foreground italic">
              (Placeholder: Campos para Nome da Empresa, CNPJ - se o treinamento for para uma empresa específica)
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-destructive/10 border-destructive/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Template e Geração de PDF
            </h3>
            <p className="text-sm text-destructive/80 italic">
              (Placeholder: Seleção de modelo de certificado e lógica para gerar o PDF com os dados preenchidos. Esta é uma funcionalidade complexa que será desenvolvida.)
            </p>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled>
              Gerar e Salvar Certificado (Em Desenvolvimento)
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
