'use client';
import { PageHeader } from '@/components/common/page-header';
import { IncidentForm } from '@/components/reports/incident-form';
import { useParams } from 'next/navigation';

export default function EditReportPage() {
  const params = useParams();
  const reportId = params.id;

  // Placeholder: In a real app, fetch report data using reportId
  const mockInitialData = {
    incidentType: 'near-miss',
    description: `This is a sample description for report ${reportId}. More details would be loaded here.`,
    location: 'Sector Alpha-7',
    date: new Date(Date.now() - 86400000 * 5), // 5 days ago
  };

  return (
    <>
      <PageHeader 
        title={`Edit Report #${reportId}`} // i18n: editReport.title
        description="Update the details of this incident report." // i18n: editReport.description
      />
      <IncidentForm initialData={mockInitialData} />
    </>
  );
}
