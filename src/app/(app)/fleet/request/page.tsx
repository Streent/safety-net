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
        description="Preencha os detalhes abaixo para solicitar um veículo. Sua solicitação será enviada para aprovação."
      />
      <RequestVehicleForm />
    </>
  );
}


export default function RequestVehiclePage() {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/> Carregando formulário...</div>}>
      <VehicleRequestPageContents />
    </Suspense>
  );
}
