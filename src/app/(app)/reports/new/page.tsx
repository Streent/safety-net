import { PageHeader } from '@/components/common/page-header';
import { IncidentForm } from '@/components/reports/incident-form';

export default function NewReportPage() {
  return (
    <>
      <PageHeader 
        title="New Incident Report" // i18n: newReport.title
        description="Log a new safety incident, observation, or near miss." // i18n: newReport.description
      />
      <IncidentForm />
    </>
  );
}
