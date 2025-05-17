import React from 'react';

interface CompanyDetailProps {
  // Define props if needed, e.g., company ID
}

const CompanyDetailPage: React.FC<CompanyDetailProps> = () => {
  // TODO: Fetch company data, people data, and document data based on the company ID from the URL
  // Example: const { id } = useParams(); // If using react-router-dom or similar
  // Use fetched data to populate the sections below

  return (
    <div className="company-detail-page">
      <h1>Company Details</h1>

      <section className="company-info">
        <h2>Company Information</h2>
        {/* TODO: Add specific fields for company information, e.g., */}
        {/* <p>Name: {companyData.name}</p> */}
        {/* <p>Address: {companyData.address}</p> */}
        {/* <p>Contact Email: {companyData.email}</p> */}
        {/* <p>Phone: {companyData.phone}</p> */}
      </section>

      <section className="company-people">
        <h2>Related People</h2>
        <ul>
          {/* TODO: Loop through people data and display each person */}
          {/* Example: */}
          {/* {peopleData.map(person => (
            <li key={person.id}>
              <p>Name: {person.name}</p>
              <p>Contact: {person.contactInfo}</p>
            </li>
          ))} */}
          <li>Placeholder Person 1</li>
          <li>Placeholder Person 2</li>
        </ul>
      </section>

      <section className="company-documents">
        <h2>Related Documents</h2>
        <ul>
          {/* TODO: Loop through document data and display each document */}
          {/* Example: */}
          {/* {documentData.map(doc => (
            <li key={doc.id}>
              <a href={doc.url}>{doc.name}</a>
            </li>
          ))} */}
          <li>Placeholder Document 1</li>
          <li>Placeholder Document 2</li>
        </ul>
      </section>

      {/* TODO: Add basic styling */}
      <style jsx>{`
        .company-detail-page {
          padding: 20px;
        }
        .company-info, .company-people, .company-documents {
          margin-bottom: 20px;
          border: 1px solid #ccc;
          padding: 15px;
          border-radius: 5px;
        }
        .company-people ul, .company-documents ul {
          list-style: none;
          padding: 0;
        }
        .company-people li, .company-documents li {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default CompanyDetailPage;