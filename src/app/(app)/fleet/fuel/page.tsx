// src/app/(app)/fleet/fuel/page.tsx
'use client';

import { PageHeader } from '@/components/common/page-header';
import { FuelRequestForm } from '@/components/fleet/fuel-request-form';
import { Suspense } from 'react';

function FuelRequestPageContents() {
  return (
    <>
      <PageHeader
        title="Registrar Abastecimento de Veículo"
        description="Preencha os detalhes do abastecimento realizado."
      />
      <FuelRequestForm />
    </>
  );
}

export default function FuelRequestPage() {
  return (
    <Suspense fallback={<div>Carregando formulário de abastecimento...</div>}>
      <FuelRequestPageContents />
    </Suspense>
  );
}
