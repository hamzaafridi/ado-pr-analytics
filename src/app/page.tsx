'use client';

import { useState } from 'react';
import { AzureDevOpsCredentials } from '@/types';
import AuthForm from '@/components/AuthForm';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [credentials, setCredentials] = useState<AzureDevOpsCredentials | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthenticate = async (creds: AzureDevOpsCredentials) => {
    setIsLoading(true);
    try {
      // Test the connection first
      const { AzureDevOpsClient } = await import('@/lib/azure');
      const client = new AzureDevOpsClient(creds);
      const isValid = await client.testConnection();
      
      if (isValid) {
        setCredentials(creds);
      } else {
        throw new Error('Invalid credentials. Please check your organization, project, and Personal Access Token.');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCredentials(null);
  };

  if (credentials) {
    return <Dashboard credentials={credentials} onLogout={handleLogout} />;
  }

  return <AuthForm onAuthenticate={handleAuthenticate} isLoading={isLoading} />;
}
