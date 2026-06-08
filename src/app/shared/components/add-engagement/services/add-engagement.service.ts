import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddEngagementModel, AddEngagementResponse } from '../models/add-engagement.model';
import { EnvService } from '../../../services/env-service/env.service';

@Injectable({
  providedIn: 'root'
})
export class AddEngagementService {

  constructor(private http: HttpClient) { }

  submitEngagement(engagementData: AddEngagementModel): Observable<AddEngagementResponse> {
    const apiUrl = `${EnvService.apiURL}/api/Engagement`;
    return this.http.post<AddEngagementResponse>(apiUrl, engagementData);
  }

  updateEngagement(engagementId: number, engagementData: AddEngagementModel): Observable<AddEngagementResponse> {
    const apiUrl = `${EnvService.apiURL}/api/Engagement/${engagementId}`;
    return this.http.put<AddEngagementResponse>(apiUrl, engagementData);
  }

  getEngagementTypes(): Observable<any[]> {
    const apiUrl = `${EnvService.apiURL}/api/engagement-types`;
    return this.http.get<any[]>(apiUrl);
  }

  getRegions(): Observable<any[]> {
    const apiUrl = `${EnvService.apiURL}/api/regions`;
    return this.http.get<any[]>(apiUrl);
  }

  getBusinessUnits(): Observable<any[]> {
    const apiUrl = `${EnvService.apiURL}/api/business-units`;
    return this.http.get<any[]>(apiUrl);
  }

  getAdGroups(): Observable<any[]> {
    const apiUrl = `${EnvService.apiURL}/api/ad-groups`;
    return this.http.get<any[]>(apiUrl);
  }
}
