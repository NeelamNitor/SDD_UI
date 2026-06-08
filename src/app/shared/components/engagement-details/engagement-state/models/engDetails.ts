export interface EngdetailsModel {
  id?: number;
  engagementId?: number;
  engagementName: string;
  engagementCode?: string;
  engagementManager?: string;
  engagementPartner?: string;
  periodEndDate: string;
  regionDisplayName?: string;
  engagementTypeId?: number;
}

export interface EngagementDetailsState {
  entities: EngdetailsModel[] | null;
  loading: boolean;
  error: string | null;
  editingEngagement: EngdetailsModel | null;
  successMessage: string | null;
  showSuccessAlert: boolean;
}
