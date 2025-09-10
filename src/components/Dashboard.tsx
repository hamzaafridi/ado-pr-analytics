"use client";

import { useState, useEffect } from "react";
import { AzureDevOpsCredentials, AnalyticsData, DateRange } from "@/types";
import { AzureDevOpsClient } from "@/lib/azure";
import { calculateAnalytics } from "@/lib/analytics";
import MetricsCards from "./MetricsCards";
import UserMetricsTable from "./UserMetricsTable";
import TimeSeriesChart from "./TimeSeriesChart";
import OpenPRMetricsCards from "./OpenPRMetricsCards";
import OpenPRUserPieChart from "./OpenPRUserPieChart";
import ReviewerPieChart from "./ReviewerPieChart";
import ReviewerMetricsTable from "./ReviewerMetricsTable";
import OpenPRsTable from "./OpenPRsTable";
import DateRangeFilter from "./DateRangeFilter";

interface DashboardProps {
  credentials: AzureDevOpsCredentials;
  onLogout: () => void;
}

export default function Dashboard({ credentials, onLogout }: DashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [rawPRs, setRawPRs] = useState<any[]>([]);
  const [rawOpenPRs, setRawOpenPRs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const client = new AzureDevOpsClient(credentials);
        const [prs, openPRs] = await Promise.all([
          client.getPullRequests(),
          client.getOpenPullRequests(),
        ]);

        // Store raw data for filtering
        setRawPRs(prs);
        setRawOpenPRs(openPRs);

        // Calculate initial analytics
        const analyticsData = calculateAnalytics(prs, openPRs, dateRange);
        setAnalytics(analyticsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching data"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [credentials]);

  // Recalculate analytics when date range changes
  useEffect(() => {
    if (rawPRs.length > 0 || rawOpenPRs.length > 0) {
      const analyticsData = calculateAnalytics(rawPRs, rawOpenPRs, dateRange);
      setAnalytics(analyticsData);
    }
  }, [dateRange, rawPRs, rawOpenPRs]);

  const handleDateRangeChange = (newDateRange: DateRange | null) => {
    setDateRange(newDateRange);
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const client = new AzureDevOpsClient(credentials);
      const [prs, openPRs] = await Promise.all([
        client.getPullRequests(dateRange),
        client.getOpenPullRequests(dateRange),
      ]);

      // Store raw data for filtering
      setRawPRs(prs);
      setRawOpenPRs(openPRs);

      // Calculate analytics
      const analyticsData = calculateAnalytics(prs, openPRs, dateRange);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while refreshing data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pull request data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Error Loading Data
              </h3>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Retry
            </button>
            <button
              onClick={onLogout}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PR Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                {credentials.organization} / {credentials.project}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
              </button>
              <button
                onClick={onLogout}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <DateRangeFilter
          onDateRangeChange={handleDateRangeChange}
          initialDateRange={dateRange}
        />

        {/* Closed PR Metrics Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Closed PR Analytics
          </h2>
          <MetricsCards metrics={analytics.overallMetrics} />
        </div>

        {/* Open PR Metrics Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Open PR Analytics
          </h2>
          <OpenPRMetricsCards metrics={analytics.openPRAnalytics.metrics} />
        </div>

        {/* Charts and Tables */}
        <div className="space-y-8">
          {/* Time Series Chart */}
          <div>
            <TimeSeriesChart data={analytics.timeSeriesData} />
          </div>

          {/* Open PR Pie Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <OpenPRUserPieChart
              userCounts={analytics.openPRAnalytics.userCounts}
            />
            <ReviewerPieChart
              reviewerMetrics={analytics.openPRAnalytics.reviewerMetrics}
            />
          </div>

          {/* User Metrics Table */}
          <div>
            <UserMetricsTable userMetrics={analytics.userMetrics} />
          </div>

          {/* Reviewer Metrics Table */}
          <div>
            <ReviewerMetricsTable
              reviewerMetrics={analytics.openPRAnalytics.reviewerMetrics}
            />
          </div>

          {/* Open PRs Table */}
          <div>
            <OpenPRsTable openPRs={analytics.openPRAnalytics.openPRs} />
          </div>
        </div>
      </div>
    </div>
  );
}
