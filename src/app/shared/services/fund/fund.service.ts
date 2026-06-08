import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from '../env-service/env.service';
import {
  Fund,
  FundResponse,
  FundSaveRequest,
  DeleteFundsResponse,
  LookupItem
} from '../../../features/fund/fund-state/fund.model';

@Injectable({
  providedIn: 'root'
})
export class FundService {
  private get baseUrl(): string {
    return `${EnvService.apiURL}/api`;
  }

  constructor(private http: HttpClient) {}

  getFunds(engagementId: number): Observable<Fund[]> {
    return this.http.get<Fund[]>(`${this.baseUrl}/Fund`, {
      params: { engagementId: engagementId.toString() }
    });
  }

  addFund(row: FundSaveRequest): Observable<FundResponse> {
    return this.http.post<FundResponse>(`${this.baseUrl}/Fund`, row);
  }

  updateFund(fundId: number, row: FundSaveRequest): Observable<FundResponse> {
    return this.http.put<FundResponse>(`${this.baseUrl}/Fund/${fundId}`, row);
  }

  deleteFunds(fundIds: number[]): Observable<DeleteFundsResponse> {
    return this.http.delete<DeleteFundsResponse>(`${this.baseUrl}/Fund`, {
      body: { fundIds }
    });
  }

  getTypeOfFunds(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.baseUrl}/lookup/fund-types`);
  }

  getTypeOfInvestments(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.baseUrl}/lookup/investment-types`);
  }

  getFundAdministrators(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.baseUrl}/lookup/fund-administrators`);
  }

  getBrokerCustodians(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.baseUrl}/lookup/broker-custodians`);
  }

  getReportingCurrencies(): Observable<LookupItem[]> {
    return this.http.get<LookupItem[]>(`${this.baseUrl}/lookup/currencies`);
  }
}
