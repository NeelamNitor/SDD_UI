import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { EngagementService } from './engagement.service';
import { EnvService } from '../env-service/env.service';
import { EngdetailsModel } from '../../components/engagement-details/engagement-state/models/engDetails';

describe('EngagementService', () => {
  let service: EngagementService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    (window as any).__env = { apiURL: 'http://test-api' };
    (EnvService as any)._env = null;

    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'delete']);
    service = new EngagementService(httpSpy as any);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('getEngagements', () => {
    it('should GET from /api/Engagement', () => {
      const mockData: EngdetailsModel[] = [{ engagementId: 1, engagementName: 'Eng 1', periodEndDate: '2024-12-31' }];
      httpSpy.get.and.returnValue(of(mockData) as any);

      service.getEngagements().subscribe(data => expect(data).toEqual(mockData));
      expect(httpSpy.get).toHaveBeenCalledWith('http://test-api/api/Engagement');
    });

    it('should return empty array when API returns no data', () => {
      httpSpy.get.and.returnValue(of([]) as any);

      service.getEngagements().subscribe(data => expect(data).toEqual([]));
    });
  });

  describe('getEngagementById', () => {
    it('should GET from /api/Engagement/{id}', () => {
      const mockData: EngdetailsModel = { engagementId: 2, engagementName: 'Eng 2', periodEndDate: '2024-06-30' };
      httpSpy.get.and.returnValue(of(mockData) as any);

      service.getEngagementById(2).subscribe(data => expect(data).toEqual(mockData));
      expect(httpSpy.get).toHaveBeenCalledWith('http://test-api/api/Engagement/2');
    });

    it('should include the correct id in URL', () => {
      httpSpy.get.and.returnValue(of({}) as any);

      service.getEngagementById(42).subscribe();
      const calledUrl: string = httpSpy.get.calls.mostRecent().args[0];
      expect(calledUrl).toContain('/42');
    });
  });

  describe('deleteEngagement', () => {
    it('should DELETE from /api/Engagement/{id}', () => {
      httpSpy.delete.and.returnValue(of({}) as any);

      service.deleteEngagement(3).subscribe();
      expect(httpSpy.delete).toHaveBeenCalledWith('http://test-api/api/Engagement/3');
    });

    it('should include correct id in DELETE URL', () => {
      httpSpy.delete.and.returnValue(of({}) as any);

      service.deleteEngagement(7).subscribe();
      const calledUrl: string = httpSpy.delete.calls.mostRecent().args[0];
      expect(calledUrl).toContain('/7');
    });

    it('should throw synchronously when id is 0', () => {
      expect(() => service.deleteEngagement(0)).toThrowError('Invalid engagement ID for deletion');
    });

    it('should throw synchronously when id is falsy', () => {
      expect(() => service.deleteEngagement(null as any)).toThrowError('Invalid engagement ID for deletion');
    });
  });
});
