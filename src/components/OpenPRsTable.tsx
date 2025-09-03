'use client';

import { useState } from 'react';
import { OpenPR } from '@/types';
import { calculateOpenPRAge } from '@/lib/analytics';

interface OpenPRsTableProps {
  openPRs: OpenPR[];
}

type SortField = 'title' | 'createdBy' | 'age' | 'status' | 'reviewers';
type SortDirection = 'asc' | 'desc';

export default function OpenPRsTable({ openPRs }: OpenPRsTableProps) {
  const [sortField, setSortField] = useState<SortField>('age');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active'>('all');

  const formatHours = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round((hours % 24) * 10) / 10;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedData = openPRs
    .filter(pr => {
      const matchesSearch = 
        pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.createdBy.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'draft' && pr.isDraft) ||
        (statusFilter === 'active' && !pr.isDraft);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdBy':
          aValue = a.createdBy.displayName.toLowerCase();
          bValue = b.createdBy.displayName.toLowerCase();
          break;
        case 'age':
          aValue = calculateOpenPRAge(a);
          bValue = calculateOpenPRAge(b);
          break;
        case 'status':
          aValue = a.isDraft ? 0 : 1;
          bValue = b.isDraft ? 0 : 1;
          break;
        case 'reviewers':
          aValue = a.reviewers?.length || 0;
          bValue = b.reviewers?.length || 0;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getVoteStatus = (vote: number): { text: string; color: string } => {
    switch (vote) {
      case -10:
        return { text: 'Rejected', color: 'bg-red-100 text-red-800' };
      case -5:
        return { text: 'Waiting', color: 'bg-yellow-100 text-yellow-800' };
      case 0:
        return { text: 'No Vote', color: 'bg-gray-100 text-gray-800' };
      case 5:
        return { text: 'Approved', color: 'bg-green-100 text-green-800' };
      case 10:
        return { text: 'Approved+', color: 'bg-green-100 text-green-800' };
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (openPRs.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Open Pull Requests</h3>
        <p className="text-gray-500">No open pull requests found</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Open Pull Requests</h3>
            <p className="text-sm text-gray-500">Current open pull requests with age and review status</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'active')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="Search PRs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>PR</span>
                  {sortField === 'title' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdBy')}
              >
                <div className="flex items-center space-x-1">
                  <span>Author</span>
                  {sortField === 'createdBy' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('age')}
              >
                <div className="flex items-center space-x-1">
                  <span>Age</span>
                  {sortField === 'age' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {sortField === 'status' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('reviewers')}
              >
                <div className="flex items-center space-x-1">
                  <span>Reviewers</span>
                  {sortField === 'reviewers' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedData.map((pr, index) => {
              const age = calculateOpenPRAge(pr);
              const ageColor = age > 168 ? 'text-red-600' : age > 72 ? 'text-yellow-600' : 'text-green-600';
              
              return (
                <tr key={pr.pullRequestId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            #{pr.pullRequestId}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {pr.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pr.isDraft ? 'Draft' : 'Ready for Review'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6">
                        <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {pr.createdBy.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {pr.createdBy.displayName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${ageColor}`}>
                      {formatHours(age)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pr.isDraft 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {pr.isDraft ? 'Draft' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {pr.reviewers && pr.reviewers.length > 0 ? (
                        pr.reviewers.map((reviewer, idx) => {
                          const voteStatus = getVoteStatus(reviewer.vote);
                          return (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${voteStatus.color}`}
                              title={`${reviewer.displayName}: ${voteStatus.text}`}
                            >
                              {reviewer.displayName.charAt(0)}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-sm text-gray-500">No reviewers</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
