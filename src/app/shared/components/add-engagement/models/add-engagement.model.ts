export interface AddEngagementModel {
  engagementName: string;
  engagementCode?: string;
  engagementManager?: string;
  engagementPartner?: string;
  periodEndDate: string;
}

export interface AddEngagementResponse {
  success: boolean;
  engagementId?: number;
  message: string;
}
