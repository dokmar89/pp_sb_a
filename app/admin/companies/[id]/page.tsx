'use client'
import React from 'react';
import { AdminGuard } from "@/components/admin/admin-guard"; // Ujisti se, že import AdminGuard je tady

interface CompanyDetailPageProps {
  params: {
    id: string
  }
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const companyId = params.id;  

  return (
    <AdminGuard requiredRole="admin">
      <div>
        <h1>Company ID: {companyId}</h1>
        <p>Detail společnosti s ID: {companyId} bude Zde</p>
      </div>
    </AdminGuard>
  );
}