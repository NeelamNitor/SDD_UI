import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AddEngagementService } from './add-engagement.service';
import { EnvService } from '../../../services/env-service/env.service';
import { AddEngagementModel } from '../models/add-engagement.model';

describe('AddEngagementService', () => {
  let service: AddEngagementService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    (window as any).__env = { apiURL: 'http://test-api' };
    (EnvService as any)._env = null;

    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put']);
    service = new AddEngagementService(httpSpy as any);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('submitEngagement', () => {
    it('should POST to /api/Engagement with the model', () => {
      const model: AddEngagementModel = { engagementName: 'Test Engagement', periodEndDate: '2024-12-31' };
      const mockRes = { success: true, message: 'Created', engagementId: 1 };
      httpSpy.post.and.returnValue(of(mockRes) as any);

      service.submitEngagement(model).subscribe(res => expect(res).toEqual(mockRes as any));
      expect(httpSpy.post).toHaveBeenCalledWith('http://test-api/api/Engagement', model);
    });

    it('should return success false response from API', () => {
      const model: AddEngagementModel = { engagementName: 'Test', periodEndDate: '2024-01-01' };
      const mockRes = { success: false, message: 'Duplicate', engagementId: undefined };
      httpSpy.post.and.returnValue(of(mockRes) as any);

      let result: any;
      service.submitEngagement(model).subscribe(r => (result = r));
      expect(result.success).toBeFalse();
      expect(result.message).toBe('Duplicate');
    });
  });

  describe('updateEngagement', () => {
    it('should PUT to /api/Engagement/{id} with the model', () => {
      const model: AddEngagementModel = { engagementName: 'Updated Eng', periodEndDate: '2024-12-31' };
      const mockRes = { success: true, message: 'Updated', engagementId: 5 };
      httpSpy.put.and.returnValue(of(mockRes) as any);

      service.updateEngagement(5, model).subscribe(res => expect(res).toEqual(mockRes as any));
      expect(httpSpy.put).toHaveBeenCalledWith('http://test-api/api/Engagement/5', model);
    });

    it('should include the correct engagementId in URL', () => {
      const model: AddEngagementModel = { engagementName: 'Eng', periodEndDate: '2024-06-30' };
      httpSpy.put.and.returnValue(of({ success: true, message: 'OK', engagementId: 99 }) as any);

      service.updateEngagement(99, model).subscribe();
      const calledUrl: string = httpSpy.put.calls.mostRecent().args[0];
      expect(calledUrl).toContain('/99');
    });
  });

  describe('getEngagementTypes', () => {
    it('should GET from /api/engagement-types', () => {
      httpSpy.get.and.returnValue(of([{ id: 1, name: 'Audit' }]) as any);
      service.getEngagementTypes().subscribe();
      expect(httpSpy.get).toHaveBeenCalledWith('http://test-api/api/engagement-types');
    });
  });

  describe('getRegions', () => {
    it('should GET from /api/regions', () => {
      httpSpy.get.and.returnValue(of([]) as any);
      service.getRegions().subscribe();
      expect(httpSpy.get).toHaveBeenCalledWith('http://test-api/api/regions');
    });
  });

  describe('getBusinessUnits', () => {
    it('should GET from /api/business-units', () => {
      httpSpy.get.and.returnValue(of([]) as any);
      service.getBusinessUnits().subscribe();
      expect(httpSpy.get).toHaveBeenCalledWith('http://test-api/api/business-units');
    });
  });

  describe('getAdGroups', () => {
    it('should GET from /api/ad-groups', () => {
      httpSpy.get.and.returnValue(of([]) as any);
      service.getAdGroups().subscribe();
      expect(httpSpy.get).toHaveBeenCalledWith('http://test-api/api/ad-groups');
    });
  });
});
