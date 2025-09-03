'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ReviewerMetrics } from '@/types';

interface ReviewerPieChartProps {
  reviewerMetrics: ReviewerMetrics[];
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export default function ReviewerPieChart({ reviewerMetrics }: ReviewerPieChartProps) {
  const [minReviews, setMinReviews] = useState(1);

  const filteredData = reviewerMetrics.filter(reviewer => reviewer.reviewCount >= minReviews);
  
  const data = filteredData.map((reviewer, index) => ({
    name: reviewer.displayName,
    value: reviewer.reviewCount,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const reviewer = reviewerMetrics.find(r => r.displayName === data.name);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            {data.name}
          </p>
          <p className="text-sm text-blue-600">
            Total Reviews: {data.value}
          </p>
          {reviewer && (
            <>
              <p className="text-sm text-yellow-600">
                Pending: {reviewer.pendingReviews}
              </p>
              <p className="text-sm text-green-600">
                Approved: {reviewer.approvedReviews}
              </p>
              <p className="text-sm text-red-600">
                Rejected: {reviewer.rejectedReviews}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  if (reviewerMetrics.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reviewer Activity</h3>
        <p className="text-gray-500">No reviewer data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Reviewer Activity</h3>
            <p className="text-sm text-gray-500">Distribution of reviews by reviewer</p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Min Reviews:</label>
            <input
              type="number"
              min="1"
              max={Math.max(...reviewerMetrics.map(r => r.reviewCount))}
              value={minReviews}
              onChange={(e) => setMinReviews(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
