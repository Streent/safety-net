import { PageHeader } from '@/components/common/page-header';
import { IncidentForm } from '@/components/reports/incident-form';
import { useForm, FormProvider } from 'react-hook-form';
export default function NewReportPage() {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <PageHeader 
        title="New Incident Report" // i18n: newReport.title
        description="Log a new safety incident, observation, or near miss." // i18n: newReport.description
      />
      <IncidentForm />
    </FormProvider>
  );
}
