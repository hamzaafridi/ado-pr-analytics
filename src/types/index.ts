export interface AzureDevOpsCredentials {
  organization: string;
  project: string;
  personalAccessToken: string;
}

export interface PullRequest {
  pullRequestId: number;
  title: string;
  description: string;
  createdBy: {
    displayName: string;
    uniqueName: string;
  };
  creationDate: string;
  closedDate?: string;
  status: string;
  isDraft: boolean;
  repository?: {
    name: string;
    id: string;
  };
  sourceRefName?: string;
}

export interface PullRequestResponse {
  value: PullRequest[];
  count: number;
}

export interface PRMetrics {
  averageTimeToClose: number; // in hours
  longestTimeToClose: number; // in hours
  totalPRs: number;
  closedPRs: number;
}

export interface UserMetrics {
  displayName: string;
  uniqueName: string;
  totalPRs: number;
  closedPRs: number;
  averageTimeToClose: number; // in hours
  longestTimeToClose: number; // in hours
}

export interface TimeSeriesData {
  date: string;
  averageCloseTime: number; // in hours
  prCount: number;
}

export interface OpenPR {
  pullRequestId: number;
  title: string;
  description: string;
  createdBy: {
    displayName: string;
    uniqueName: string;
  };
  creationDate: string;
  status: string;
  isDraft: boolean;
  url: string;
  reviewers?: {
    displayName: string;
    uniqueName: string;
    vote: number; // -10: rejected, -5: waiting, 0: no vote, 5: approved, 10: approved with suggestions
  }[];
}

export interface OpenPRMetrics {
  totalOpenPRs: number;
  averageAge: number; // in hours
  oldestPR: number; // in hours
  draftPRs: number;
}

export interface UserOpenPRCount {
  displayName: string;
  uniqueName: string;
  openPRCount: number;
  averageAge: number; // in hours
}

export interface ReviewerMetrics {
  displayName: string;
  uniqueName: string;
  reviewCount: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
}

export interface OpenPRAnalytics {
  metrics: OpenPRMetrics;
  userCounts: UserOpenPRCount[];
  reviewerMetrics: ReviewerMetrics[];
  openPRs: OpenPR[];
}

export interface DateRange {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface AnalyticsData {
  overallMetrics: PRMetrics;
  userMetrics: UserMetrics[];
  timeSeriesData: TimeSeriesData[];
  openPRAnalytics: OpenPRAnalytics;
  dateRange?: DateRange;
}
