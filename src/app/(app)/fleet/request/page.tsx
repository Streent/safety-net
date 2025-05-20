// src/app/(app)/fleet/request/page.tsx
'use client';

import { PageHeader } from '@/components/common/page-header';
import { RequestVehicleForm } from '@/components/fleet/request-vehicle-form';
import { Suspense } from 'react';

function VehicleRequestPageContents() {
  return (
    <>
      <PageHeader
        title="Solicitar Veículo da Frota"
        description="Preencha os detalhes abaixo para solicitar um veículo."
      />
      <RequestVehicleForm />
    </>
  );
}


export default function RequestVehiclePage() {
  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
      <VehicleRequestPageContents />
    </Suspense>
  );
}
