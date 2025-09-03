import { PullRequest, PRMetrics, UserMetrics, TimeSeriesData, AnalyticsData, OpenPR, OpenPRMetrics, UserOpenPRCount, ReviewerMetrics, OpenPRAnalytics, DateRange } from '@/types';

export function calculateTimeToClose(pr: PullRequest): number | null {
  if (!pr.closedDate) return null;
  
  const createdDate = new Date(pr.creationDate);
  const closedDate = new Date(pr.closedDate);
  const diffInMs = closedDate.getTime() - createdDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  return diffInHours;
}

export function calculateOverallMetrics(prs: PullRequest[]): PRMetrics {
  const closedPRs = prs.filter(pr => pr.closedDate);
  const closeTimes = closedPRs
    .map(pr => calculateTimeToClose(pr))
    .filter((time): time is number => time !== null);

  const totalPRs = prs.length;
  const closedPRsCount = closedPRs.length;
  const averageTimeToClose = closeTimes.length > 0 
    ? closeTimes.reduce((sum, time) => sum + time, 0) / closeTimes.length 
    : 0;
  const longestTimeToClose = closeTimes.length > 0 
    ? Math.max(...closeTimes) 
    : 0;

  return {
    averageTimeToClose,
    longestTimeToClose,
    totalPRs,
    closedPRs: closedPRsCount
  };
}

export function calculateUserMetrics(prs: PullRequest[]): UserMetrics[] {
  const userMap = new Map<string, {
    displayName: string;
    uniqueName: string;
    prs: PullRequest[];
  }>();

  // Group PRs by user
  prs.forEach(pr => {
    const key = pr.createdBy.uniqueName;
    if (!userMap.has(key)) {
      userMap.set(key, {
        displayName: pr.createdBy.displayName,
        uniqueName: pr.createdBy.uniqueName,
        prs: []
      });
    }
    userMap.get(key)!.prs.push(pr);
  });

  // Calculate metrics for each user
  return Array.from(userMap.values()).map(user => {
    const closedPRs = user.prs.filter(pr => pr.closedDate);
    const closeTimes = closedPRs
      .map(pr => calculateTimeToClose(pr))
      .filter((time): time is number => time !== null);

    const averageTimeToClose = closeTimes.length > 0 
      ? closeTimes.reduce((sum, time) => sum + time, 0) / closeTimes.length 
      : 0;
    const longestTimeToClose = closeTimes.length > 0 
      ? Math.max(...closeTimes) 
      : 0;

    return {
      displayName: user.displayName,
      uniqueName: user.uniqueName,
      totalPRs: user.prs.length,
      closedPRs: closedPRs.length,
      averageTimeToClose,
      longestTimeToClose
    };
  }).sort((a, b) => b.totalPRs - a.totalPRs);
}

export function calculateTimeSeriesData(prs: PullRequest[]): TimeSeriesData[] {
  const closedPRs = prs.filter(pr => pr.closedDate);
  const weeklyData = new Map<string, { totalTime: number; count: number }>();

  closedPRs.forEach(pr => {
    const closeTime = calculateTimeToClose(pr);
    if (closeTime === null) return;

    const closedDate = new Date(pr.closedDate!);
    const weekStart = new Date(closedDate);
    weekStart.setDate(closedDate.getDate() - closedDate.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, { totalTime: 0, count: 0 });
    }
    
    const data = weeklyData.get(weekKey)!;
    data.totalTime += closeTime;
    data.count += 1;
  });

  return Array.from(weeklyData.entries())
    .map(([date, data]) => ({
      date,
      averageCloseTime: data.totalTime / data.count,
      prCount: data.count
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateOpenPRAge(pr: OpenPR): number {
  const createdDate = new Date(pr.creationDate);
  const now = new Date();
  const diffInMs = now.getTime() - createdDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  return diffInHours;
}

export function calculateOpenPRMetrics(openPRs: OpenPR[]): OpenPRMetrics {
  const ages = openPRs.map(pr => calculateOpenPRAge(pr));
  const totalOpenPRs = openPRs.length;
  const averageAge = ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;
  const oldestPR = ages.length > 0 ? Math.max(...ages) : 0;
  const draftPRs = openPRs.filter(pr => pr.isDraft).length;

  return {
    totalOpenPRs,
    averageAge,
    oldestPR,
    draftPRs
  };
}

export function calculateUserOpenPRCounts(openPRs: OpenPR[]): UserOpenPRCount[] {
  const userMap = new Map<string, {
    displayName: string;
    uniqueName: string;
    prs: OpenPR[];
  }>();

  // Group PRs by user
  openPRs.forEach(pr => {
    const key = pr.createdBy.uniqueName;
    if (!userMap.has(key)) {
      userMap.set(key, {
        displayName: pr.createdBy.displayName,
        uniqueName: pr.createdBy.uniqueName,
        prs: []
      });
    }
    userMap.get(key)!.prs.push(pr);
  });

  // Calculate metrics for each user
  return Array.from(userMap.values()).map(user => {
    const ages = user.prs.map(pr => calculateOpenPRAge(pr));
    const averageAge = ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;

    return {
      displayName: user.displayName,
      uniqueName: user.uniqueName,
      openPRCount: user.prs.length,
      averageAge
    };
  }).sort((a, b) => b.openPRCount - a.openPRCount);
}

export function calculateReviewerMetrics(openPRs: OpenPR[]): ReviewerMetrics[] {
  const reviewerMap = new Map<string, {
    displayName: string;
    uniqueName: string;
    reviews: { vote: number }[];
  }>();

  // Collect all reviewers from all PRs
  openPRs.forEach(pr => {
    if (pr.reviewers) {
      pr.reviewers.forEach(reviewer => {
        const key = reviewer.uniqueName;
        if (!reviewerMap.has(key)) {
          reviewerMap.set(key, {
            displayName: reviewer.displayName,
            uniqueName: reviewer.uniqueName,
            reviews: []
          });
        }
        reviewerMap.get(key)!.reviews.push({ vote: reviewer.vote });
      });
    }
  });

  // Calculate metrics for each reviewer
  return Array.from(reviewerMap.values()).map(reviewer => {
    const reviewCount = reviewer.reviews.length;
    const pendingReviews = reviewer.reviews.filter(r => r.vote === -5 || r.vote === 0).length;
    const approvedReviews = reviewer.reviews.filter(r => r.vote === 5 || r.vote === 10).length;
    const rejectedReviews = reviewer.reviews.filter(r => r.vote === -10).length;

    return {
      displayName: reviewer.displayName,
      uniqueName: reviewer.uniqueName,
      reviewCount,
      pendingReviews,
      approvedReviews,
      rejectedReviews
    };
  }).sort((a, b) => b.reviewCount - a.reviewCount);
}

export function calculateOpenPRAnalytics(openPRs: OpenPR[]): OpenPRAnalytics {
  return {
    metrics: calculateOpenPRMetrics(openPRs),
    userCounts: calculateUserOpenPRCounts(openPRs),
    reviewerMetrics: calculateReviewerMetrics(openPRs),
    openPRs: openPRs.sort((a, b) => calculateOpenPRAge(b) - calculateOpenPRAge(a)) // Sort by age, oldest first
  };
}

export function filterPRsByDateRange(prs: PullRequest[], dateRange: DateRange | null): PullRequest[] {
  if (!dateRange) return prs;
  
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  
  return prs.filter(pr => {
    const creationDate = new Date(pr.creationDate);
    return creationDate >= startDate && creationDate <= endDate;
  });
}

export function filterOpenPRsByDateRange(openPRs: OpenPR[], dateRange: DateRange | null): OpenPR[] {
  if (!dateRange) return openPRs;
  
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  
  return openPRs.filter(pr => {
    const creationDate = new Date(pr.creationDate);
    return creationDate >= startDate && creationDate <= endDate;
  });
}

export function calculateAnalytics(prs: PullRequest[], openPRs: OpenPR[], dateRange?: DateRange | null): AnalyticsData {
  const filteredPRs = filterPRsByDateRange(prs, dateRange || null);
  const filteredOpenPRs = filterOpenPRsByDateRange(openPRs, dateRange || null);
  
  return {
    overallMetrics: calculateOverallMetrics(filteredPRs),
    userMetrics: calculateUserMetrics(filteredPRs),
    timeSeriesData: calculateTimeSeriesData(filteredPRs),
    openPRAnalytics: calculateOpenPRAnalytics(filteredOpenPRs),
    dateRange: dateRange || undefined
  };
}
