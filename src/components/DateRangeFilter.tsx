'use client';

import { useState, useEffect } from 'react';
import { DateRange } from '@/types';

interface DateRangeFilterProps {
  onDateRangeChange: (dateRange: DateRange | null) => void;
  initialDateRange?: DateRange | null;
}

export default function DateRangeFilter({ onDateRangeChange, initialDateRange }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);

  // Initialize with default date range (last 30 days) if no initial range provided
  useEffect(() => {
    if (initialDateRange) {
      setStartDate(initialDateRange.startDate);
      setEndDate(initialDateRange.endDate);
      setIsActive(true);
    } else {
      // Default to last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      setEndDate(endDate.toISOString().split('T')[0]);
      setStartDate(startDate.toISOString().split('T')[0]);
    }
  }, [initialDateRange]);

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    if (isActive && date && endDate) {
      onDateRangeChange({
        startDate: new Date(date).toISOString(),
        endDate: new Date(endDate).toISOString()
      });
    }
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    if (isActive && startDate && date) {
      onDateRangeChange({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(date).toISOString()
      });
    }
  };

  const handleToggle = () => {
    const newActive = !isActive;
    setIsActive(newActive);
    
    if (newActive && startDate && endDate) {
      onDateRangeChange({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      });
    } else {
      onDateRangeChange(null);
    }
  };

  const setPresetRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    setEndDate(endDate.toISOString().split('T')[0]);
    setStartDate(startDate.toISOString().split('T')[0]);
    
    if (isActive) {
      onDateRangeChange({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    }
  };

  const formatDateRange = () => {
    if (!isActive) return 'All Time';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="dateFilter"
              checked={isActive}
              onChange={handleToggle}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="dateFilter" className="ml-2 text-sm font-medium text-gray-700">
              Filter by Date Range
            </label>
          </div>
          
          {isActive && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Showing:</span>
              <span className="font-medium text-blue-600">{formatDateRange()}</span>
            </div>
          )}
        </div>

        {isActive && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Quick:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setPresetRange(7)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  7d
                </button>
                <button
                  onClick={() => setPresetRange(30)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  30d
                </button>
                <button
                  onClick={() => setPresetRange(90)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  90d
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
