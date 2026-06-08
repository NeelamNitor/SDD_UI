import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EngdetailsModel } from '../../components/engagement-details/engagement-state/models/engDetails';
import { EnvService } from '../env-service/env.service';

@Injectable({
  providedIn: 'root'
})
export class EngagementService {
  constructor(private http: HttpClient) {}

  // Get all engagements from API
  getEngagements(): Observable<EngdetailsModel[]> {
    const apiUrl = `${EnvService.apiURL}/api/Engagement`;
    return this.http.get<EngdetailsModel[]>(apiUrl);
  }

  // Get engagement by ID
  getEngagementById(engagementId: number): Observable<EngdetailsModel> {
    const apiUrl = `${EnvService.apiURL}/api/Engagement/${engagementId}`;
    return this.http.get<EngdetailsModel>(apiUrl);
  }

  // Delete engagement by ID
  deleteEngagement(engagementId: number): Observable<any> {
    console.log('Service Delete - ID:', engagementId, 'Type:', typeof engagementId);
    if (!engagementId || engagementId === 0) {
      throw new Error('Invalid engagement ID for deletion');
    }
    const apiUrl = `${EnvService.apiURL}/api/Engagement/${engagementId}`;
    console.log('Delete API URL:', apiUrl);
    return this.http.delete(apiUrl);
  }
}

