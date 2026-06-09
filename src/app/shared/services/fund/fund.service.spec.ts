import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { FundService } from './fund.service';
import { EnvService } from '../env-service/env.service';
import { FundSaveRequest, Fund } from '../../../features/fund/fund-state/fund.model';

describe('FundService', () => {
  let service: FundService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const mockSaveRequest: FundSaveRequest = {
    engagementId: 1,
    fundName: 'Fund Alpha',
    typeOfFundId: 1,
    typesOfInvestmentIds: [2, 3],
    fundAdministratorId: 1,
    brokerCustodianIds: [4],
    reportingCurrencyId: 1,
    periodBeginDate: '2024-01-01',
    periodEndDate: '2024-12-31',
    expectedAuditSignOffDate: '2025-01-15'
  };

  beforeEach(() => {
    (window as any).__env = { apiURL: 'http://test-api' };
    (EnvService as any)._env = null;

    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
    service = new FundService(httpSpy as any);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('getFunds', () => {
    it('should GET /api/Fund with engagementId query param', () => {
      httpSpy.get.and.returnValue(of([]) as any);

      service.getFunds(10).subscribe();
      expect(httpSpy.get).toHaveBeenCalledWith(
        'http://test-api/api/Fund',
        { params: { engagementId: '10' } }
      );
    });

    it('should return fund array from response', () => {
      const mockFunds = [{ fundId: 1, engagementId: 10, fundName: 'F1' }] as Fund[];
      httpSpy.get.and.returnValue(of(mockFunds) as any);

      service.getFunds(10).subscribe(data => expect(data).toEqual(mockFunds));
    });
  });

  describe('addFund', () => {
    it('should POST to /api/Fund with body', () => {
      const mockRes = { success: true, message: 'Created', fundId: 1 };
      httpSpy.post.and.returnValue(of(mockRes) as any);

      service.addFund(mockSaveRequest).subscribe(res => expect(res).toEqual(mockRes as any));
      expect(httpSpy.post).toHaveBeenCalledWith('http://test-api/api/Fund', mockSaveRequest);
    });
  });

  describe('updateFund', () => {
    it('should PUT to /api/Fund/{fundId}', () => {
      httpSpy.put.and.returnValue(of({ success: true, message: 'Updated', fundId: 5 }) as any);

      service.updateFund(5, mockSaveRequest).subscribe();
      expect(httpSpy.put).toHaveBeenCalledWith('http://test-api/api/Fund/5', mockSaveRequest);
    });

    it('should include correct fundId in URL', () => {
      httpSpy.put.and.returnValue(of({}) as any);

      service.updateFund(99, mockSaveRequest).subscribe();
      const calledUrl: string = httpSpy.put.calls.mostRecent().args[0];
      expect(calledUrl).toContain('/99');
    });
  });

  describe('deleteFunds', () => {
    it('should DELETE /api/Fund with fundIds in body', () => {
      httpSpy.delete.and.returnValue(of({ deleted: [1, 2, 3], skipped: [] }) as any);

      service.deleteFunds([1, 2, 3]).subscribe();
      expect(httpSpy.delete).toHaveBeenCalledWith(
        'http://test-api/api/Fund',
        { body: { fundIds: [1, 2, 3] } }
      );
    });
  });

  describe('lookup endpoints', () => {
    it('getTypeOfFunds should GET /api/lookup/fund-types', () => {
      httpSpy.get.and.returnValue(of([{ id: 1, name: 'Hedge' }]) as any);
      service.getTypeOfFunds().subscribe();
      expect(httpSpy.get).toHaveBeenCalledWith('http://test-api/api/lookup/fund-types');
    });

    it('getTypeOfInvestments should GET /api/lookup/investment-types', () => {
      httpSpy.get.and.returnValue(of([]) as any);
      service.getTypeOfInvestments().subscribe();
      expect(httpSpy.get).toHaveBeenCalledWith('http://test-api/api/lookup/investment-types');
    });

    it('getFundAdministrators should GET /api/lookup/fund-administrators', () => {
      httpSpy.get.and.returnValue(of([]) as any);
      service.getFundAdministrators().subscribe();
      expect(httpSpy.get).toHaveBeenCalledWith('http://test-api/api/lookup/fund-administrators');
    });

    it('getBrokerCustodians should GET /api/lookup/broker-custodians', () => {
      httpSpy.get.and.returnValue(of([]) as any);
      service.getBrokerCustodians().subscribe();
      expect(httpSpy.get).toHaveBeenCalledWith('http://test-api/api/lookup/broker-custodians');
    });

    it('getReportingCurrencies should GET /api/lookup/currencies', () => {
      httpSpy.get.and.returnValue(of([]) as any);
      service.getReportingCurrencies().subscribe();
      expect(httpSpy.get).toHaveBeenCalledWith('http://test-api/api/lookup/currencies');
    });
  });
});
