// app/admin/companies/[id]/page.tsx
import React from 'react';

interface CompanyDetailPageProps {
  params: {
    id: string
  }
}

export async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const companyId = await params.id; // No await here, just direct access

  return (
    <div>
      <h1>Company ID: {companyId}</h1>
    </div>
  );
}