import axios, { AxiosInstance } from "axios";
import {
  AzureDevOpsCredentials,
  PullRequestResponse,
  PullRequest,
  OpenPR,
  DateRange,
} from "@/types";

export class AzureDevOpsClient {
  private client: AxiosInstance;
  private credentials: AzureDevOpsCredentials;

  constructor(credentials: AzureDevOpsCredentials) {
    this.credentials = credentials;
    this.client = axios.create({
      baseURL: `https://dev.azure.com/${credentials.organization}/${credentials.project}/_apis`,
      auth: {
        username: "",
        password: credentials.personalAccessToken,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getPullRequests(dateRange?: DateRange | null): Promise<PullRequest[]> {
    try {
      const params: any = {
        "api-version": "7.0",
        status: "all", // Get all PRs (active, completed, abandoned)
        $top: 1000, // Get up to 1000 PRs
      };

      // Add date filtering if provided
      if (dateRange) {
        params.searchCriteria = {
          createdAfter: dateRange.startDate,
          createdBefore: dateRange.endDate,
        };
      }

      const response = await this.client.get<PullRequestResponse>(
        "/git/pullrequests",
        {
          params,
        }
      );

      return response.data.value;
    } catch (error) {
      console.error("Error fetching pull requests:", error);
      throw new Error(
        "Failed to fetch pull requests. Please check your credentials and try again."
      );
    }
  }

  async getOpenPullRequests(dateRange?: DateRange | null): Promise<OpenPR[]> {
    try {
      const params: any = {
        "api-version": "7.0",
        status: "active", // Get only active/open PRs
        $top: 1000, // Get up to 1000 PRs
      };

      // Add date filtering if provided
      if (dateRange) {
        params.searchCriteria = {
          createdAfter: dateRange.startDate,
          createdBefore: dateRange.endDate,
        };
      }

      const response = await this.client.get<PullRequestResponse>(
        "/git/pullrequests",
        {
          params,
        }
      );

      const prs = response.data.value;

      // Fetch reviewer information for each PR
      const prsWithReviewers = await Promise.all(
        prs.map(async (pr) => {
          try {
            const reviewersResponse = await this.client.get(
              `/git/pullrequests/${pr.pullRequestId}/reviewers`,
              {
                params: {
                  "api-version": "7.0",
                },
              }
            );

            const reviewers = reviewersResponse.data?.value || [];
            const formattedReviewers = reviewers.map((reviewer: any) => ({
              displayName:
                reviewer.displayName || reviewer.uniqueName || "Unknown",
              uniqueName: reviewer.uniqueName || reviewer.id || "unknown",
              vote: reviewer.vote || 0,
            }));

            // Extract repository name from sourceRefName if repository.name is not available
            const repoName =
              pr.repository?.name ||
              (pr.sourceRefName ? pr.sourceRefName.split("/")[2] : "default");

            return {
              ...pr,
              url: `https://dev.azure.com/${this.credentials.organization}/${this.credentials.project}/_git/${repoName}/pullrequest/${pr.pullRequestId}`,
              reviewers: formattedReviewers,
            };
          } catch (error) {
            console.warn(
              `Failed to fetch reviewers for PR ${pr.pullRequestId}:`,
              error
            );
            // Extract repository name from sourceRefName if repository.name is not available
            const repoName =
              pr.repository?.name ||
              (pr.sourceRefName ? pr.sourceRefName.split("/")[2] : "default");

            return {
              ...pr,
              url: `https://dev.azure.com/${this.credentials.organization}/${this.credentials.project}/_git/${repoName}/pullrequest/${pr.pullRequestId}`,
              reviewers: [],
            };
          }
        })
      );

      return prsWithReviewers;
    } catch (error) {
      console.error("Error fetching open pull requests:", error);
      throw new Error(
        "Failed to fetch open pull requests. Please check your credentials and try again."
      );
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get("/git/repositories", {
        params: {
          "api-version": "7.0",
        },
      });
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }
}
