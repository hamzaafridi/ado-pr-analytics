'use client';

import { useState } from 'react';
import { AzureDevOpsCredentials } from '@/types';

interface AuthFormProps {
  onAuthenticate: (credentials: AzureDevOpsCredentials) => void;
  isLoading: boolean;
}

export default function AuthForm({ onAuthenticate, isLoading }: AuthFormProps) {
  const [formData, setFormData] = useState<AzureDevOpsCredentials>({
    organization: '',
    project: '',
    personalAccessToken: ''
  });

  const [errors, setErrors] = useState<Partial<AzureDevOpsCredentials>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Partial<AzureDevOpsCredentials> = {};
    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization name is required';
    }
    if (!formData.project.trim()) {
      newErrors.project = 'Project name is required';
    }
    if (!formData.personalAccessToken.trim()) {
      newErrors.personalAccessToken = 'Personal Access Token is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onAuthenticate(formData);
    }
  };

  const handleChange = (field: keyof AzureDevOpsCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Azure DevOps PR Analytics
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your Azure DevOps credentials to get started
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                required
                value={formData.organization}
                onChange={handleChange('organization')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.organization ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="your-organization"
              />
              {errors.organization && (
                <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
              )}
            </div>

            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                id="project"
                name="project"
                type="text"
                required
                value={formData.project}
                onChange={handleChange('project')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.project ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="your-project"
              />
              {errors.project && (
                <p className="mt-1 text-sm text-red-600">{errors.project}</p>
              )}
            </div>

            <div>
              <label htmlFor="personalAccessToken" className="block text-sm font-medium text-gray-700">
                Personal Access Token
              </label>
              <input
                id="personalAccessToken"
                name="personalAccessToken"
                type="password"
                required
                value={formData.personalAccessToken}
                onChange={handleChange('personalAccessToken')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.personalAccessToken ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your PAT"
              />
              {errors.personalAccessToken && (
                <p className="mt-1 text-sm text-red-600">{errors.personalAccessToken}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Create a PAT with Code (read) permissions in Azure DevOps
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </div>
              ) : (
                'Connect to Azure DevOps'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
