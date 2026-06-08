export interface LookupItem {
  id: number;
  name: string;
}

export interface FundLookups {
  typeOfFunds: LookupItem[];
  typeOfInvestments: LookupItem[];
  fundAdministrators: LookupItem[];
  brokerCustodians: LookupItem[];
  reportingCurrencies: LookupItem[];
}

export interface Fund {
  fundId: number;
  engagementId: number;
  fundName: string;
  typeOfFundId: number;
  typeOfFundName?: string;
  typesOfInvestmentIds: number[];
  fundAdministratorId: number;
  fundAdministratorName?: string;
  brokerCustodianIds: number[];
  reportingCurrencyId: number;
  reportingCurrencyCode?: string;
  periodBeginDate: string;
  periodEndDate: string;
  expectedAuditSignOffDate: string;
  materiality?: number | null;
  performanceMateriality?: number | null;
  auditMisstatementPostingThreshold?: number | null;
  status: string;
  createdDate?: string;
  modifiedDate?: string;
}

export interface FundRow {
  fundId?: number;
  engagementId: number;
  fundName: string;
  typeOfFundId: number | null;
  typesOfInvestmentIds: number[];
  fundAdministratorId: number | null;
  brokerCustodianIds: number[];
  reportingCurrencyId: number | null;
  periodBeginDate: string;
  periodEndDate: string;
  expectedAuditSignOffDate: string;
  materiality: number | null;
  performanceMateriality: number | null;
  auditMisstatementPostingThreshold: number | null;
  status: string;
}

export interface FundSaveRequest {
  fundId?: number;
  engagementId: number;
  fundName: string;
  typeOfFundId: number;
  typesOfInvestmentIds: number[];
  fundAdministratorId: number;
  brokerCustodianIds: number[];
  reportingCurrencyId: number;
  periodBeginDate: string;
  periodEndDate: string;
  expectedAuditSignOffDate: string;
  materiality?: number | null;
  performanceMateriality?: number | null;
  auditMisstatementPostingThreshold?: number | null;
}

export interface FundResponse {
  success: boolean;
  message: string;
  fundId: number;
}

export interface DeleteFundsResponse {
  deleted: number[];
  skipped: Array<{ id: number; name: string }>;
}

export interface FundState {
  funds: Fund[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  newlyAddedFundIds: number[];
  lookups: FundLookups;
}
