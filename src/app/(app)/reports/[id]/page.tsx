'use client';
import { PageHeader } from '@/components/common/page-header';
import { IncidentForm } from '@/components/reports/incident-form';
import { useParams } from 'next/navigation';

export default function EditReportPage() {
  const params = useParams();
  const reportId = params.id as string; // Assume id is a string

  // TODO: Fetch report data based on reportId
  // const reportData = useFetchReport(reportId); // Example hook to fetch data

  // TODO: Add state to manage form inputs
  // const [formData, setFormData] = useState({});

  // Placeholder: In a real app, fetch report data using reportId
  // This mock data should be replaced with actual fetched data
  const mockReportData = {
    reportName: `Sample Report ${reportId}`,
    technician: 'John Doe',
    details: `Detailed description for report ${reportId}.`,
    // TODO: Add more specific report fields here (e.g., date, location, type)
  }

  // TODO: Initialize form state with fetched data
  // useEffect(() => {
  //   if (reportData) {
  //     setFormData(reportData);
  //   }
  // }, [reportData]);

  // TODO: Add function to handle photo uploads
  const handleAddPhotos = () => {
    console.log('Add Photos button clicked');
    // Implement photo upload logic here
  };

  return (
    <>
      <PageHeader 
        title={`Edit Report #${reportId}`} // i18n: editReport.title
        description="Update the details of this incident report." // i18n: editReport.description
      />
      <div className="p-4"> {/* Add some padding */}
        {/* TODO: Add specific text input boxes for report details */}
        {/* Example: */}
        {/* <input type="text" value={formData.reportName} onChange={e => setFormData({...formData, reportName: e.target.value})} placeholder="Report Name" /> */}
        {/* <textarea value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} placeholder="Report Details" /> */}
        {/* Add inputs for technician, date, location, etc. */}

        {/* Button to add photos */}
        <button
          onClick={handleAddPhotos}
          className="mt-4 p-2 bg-blue-500 text-white rounded" // Basic styling
        >
          Add Photos
        </button>

        {/* TODO: Add Save or Submit button */}
        {/* <button onClick={handleSubmit} className="mt-4 p-2 bg-green-500 text-white rounded">Save Report</button> */}
      </div>
    </>
  );
}
