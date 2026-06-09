import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { FundEffects } from './fund.effects';
import { FundService } from '../../../shared/services/fund/fund.service';
import * as FundActions from './fund.actions';
import { Fund, LookupItem } from './fund.model';

function createEffects(action: Action, serviceSpy: jasmine.SpyObj<FundService>): FundEffects {
  const actions = new Actions(of(action) as Observable<Action>);
  return new FundEffects(actions, serviceSpy);
}

describe('FundEffects', () => {
  let fundServiceSpy: jasmine.SpyObj<FundService>;

  const mockFund: Fund = {
    fundId: 1, engagementId: 1, fundName: 'Fund Alpha', typeOfFundId: 1,
    typesOfInvestmentIds: [], fundAdministratorId: 1, brokerCustodianIds: [],
    reportingCurrencyId: 1, periodBeginDate: '2024-01-01', periodEndDate: '2024-12-31',
    expectedAuditSignOffDate: '2025-01-15', status: 'Active'
  };

  const mockLookupItems: LookupItem[] = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];

  beforeEach(() => {
    fundServiceSpy = jasmine.createSpyObj('FundService', [
      'getFunds', 'getTypeOfFunds', 'getTypeOfInvestments',
      'getFundAdministrators', 'getBrokerCustodians', 'getReportingCurrencies', 'deleteFunds'
    ]);
  });

  describe('loadFunds$', () => {
    it('should dispatch loadFundsSuccess with funds on success', (done) => {
      fundServiceSpy.getFunds.and.returnValue(of([mockFund]));

      const effects = createEffects(FundActions.loadFunds({ engagementId: 1 }), fundServiceSpy);
      effects.loadFunds$.subscribe(action => {
        expect(action).toEqual(FundActions.loadFundsSuccess({ funds: [mockFund] }));
        done();
      });
    });

    it('should call getFunds with the correct engagementId', (done) => {
      fundServiceSpy.getFunds.and.returnValue(of([]));

      const effects = createEffects(FundActions.loadFunds({ engagementId: 42 }), fundServiceSpy);
      effects.loadFunds$.subscribe(() => {
        expect(fundServiceSpy.getFunds).toHaveBeenCalledWith(42);
        done();
      });
    });

    it('should dispatch loadFundsFailure with error message on failure', (done) => {
      fundServiceSpy.getFunds.and.returnValue(throwError(() => ({ message: 'Load failed' })));

      const effects = createEffects(FundActions.loadFunds({ engagementId: 1 }), fundServiceSpy);
      effects.loadFunds$.subscribe(action => {
        expect(action).toEqual(FundActions.loadFundsFailure({ error: 'Load failed' }));
        done();
      });
    });

    it('should dispatch loadFundsFailure with default message when error has no message', (done) => {
      fundServiceSpy.getFunds.and.returnValue(throwError(() => ({})));

      const effects = createEffects(FundActions.loadFunds({ engagementId: 1 }), fundServiceSpy);
      effects.loadFunds$.subscribe(action => {
        expect(action).toEqual(FundActions.loadFundsFailure({ error: 'Failed to load funds' }));
        done();
      });
    });
  });

  describe('loadLookups$', () => {
    function setupLookupSpies(overrides: Partial<Record<keyof typeof fundServiceSpy, any>> = {}): void {
      fundServiceSpy.getTypeOfFunds.and.returnValue(overrides['getTypeOfFunds'] ?? of(mockLookupItems));
      fundServiceSpy.getTypeOfInvestments.and.returnValue(overrides['getTypeOfInvestments'] ?? of(mockLookupItems));
      fundServiceSpy.getFundAdministrators.and.returnValue(overrides['getFundAdministrators'] ?? of(mockLookupItems));
      fundServiceSpy.getBrokerCustodians.and.returnValue(overrides['getBrokerCustodians'] ?? of(mockLookupItems));
      fundServiceSpy.getReportingCurrencies.and.returnValue(overrides['getReportingCurrencies'] ?? of(mockLookupItems));
    }

    it('should dispatch loadLookupsSuccess with all lookup data on success', (done) => {
      setupLookupSpies();

      const effects = createEffects(FundActions.loadLookups(), fundServiceSpy);
      effects.loadLookups$.subscribe(action => {
        const result = action as ReturnType<typeof FundActions.loadLookupsSuccess>;
        expect(result.type).toBe(FundActions.loadLookupsSuccess.type);
        expect(result.lookups.typeOfFunds).toEqual(mockLookupItems);
        expect(result.lookups.typeOfInvestments).toEqual(mockLookupItems);
        expect(result.lookups.fundAdministrators).toEqual(mockLookupItems);
        expect(result.lookups.brokerCustodians).toEqual(mockLookupItems);
        expect(result.lookups.reportingCurrencies).toEqual(mockLookupItems);
        done();
      });
    });

    it('should call all five lookup service methods', (done) => {
      setupLookupSpies();

      const effects = createEffects(FundActions.loadLookups(), fundServiceSpy);
      effects.loadLookups$.subscribe(() => {
        expect(fundServiceSpy.getTypeOfFunds).toHaveBeenCalled();
        expect(fundServiceSpy.getTypeOfInvestments).toHaveBeenCalled();
        expect(fundServiceSpy.getFundAdministrators).toHaveBeenCalled();
        expect(fundServiceSpy.getBrokerCustodians).toHaveBeenCalled();
        expect(fundServiceSpy.getReportingCurrencies).toHaveBeenCalled();
        done();
      });
    });

    it('should dispatch loadLookupsSuccess with empty lookups on any forkJoin failure', (done) => {
      setupLookupSpies({ getTypeOfFunds: throwError(() => new Error('Lookup error')) });

      const effects = createEffects(FundActions.loadLookups(), fundServiceSpy);
      effects.loadLookups$.subscribe(action => {
        const result = action as ReturnType<typeof FundActions.loadLookupsSuccess>;
        expect(result.type).toBe(FundActions.loadLookupsSuccess.type);
        expect(result.lookups.typeOfFunds).toEqual([]);
        done();
      });
    });
  });

  describe('deleteFunds$', () => {
    it('should dispatch deleteFundsSuccess with response on success', (done) => {
      const response = { deleted: [1, 2], skipped: [] };
      fundServiceSpy.deleteFunds.and.returnValue(of(response));

      const effects = createEffects(FundActions.deleteFunds({ fundIds: [1, 2] }), fundServiceSpy);
      effects.deleteFunds$.subscribe(action => {
        expect(action).toEqual(FundActions.deleteFundsSuccess({ response }));
        done();
      });
    });

    it('should call deleteFunds service with the correct fundIds', (done) => {
      fundServiceSpy.deleteFunds.and.returnValue(of({ deleted: [], skipped: [] }));

      const effects = createEffects(FundActions.deleteFunds({ fundIds: [5, 6, 7] }), fundServiceSpy);
      effects.deleteFunds$.subscribe(() => {
        expect(fundServiceSpy.deleteFunds).toHaveBeenCalledWith([5, 6, 7]);
        done();
      });
    });

    it('should dispatch deleteFundsFailure with error message on failure', (done) => {
      fundServiceSpy.deleteFunds.and.returnValue(throwError(() => ({ message: 'Delete failed' })));

      const effects = createEffects(FundActions.deleteFunds({ fundIds: [1] }), fundServiceSpy);
      effects.deleteFunds$.subscribe(action => {
        expect(action).toEqual(FundActions.deleteFundsFailure({ error: 'Delete failed' }));
        done();
      });
    });

    it('should dispatch deleteFundsFailure with default message when error has no message', (done) => {
      fundServiceSpy.deleteFunds.and.returnValue(throwError(() => ({})));

      const effects = createEffects(FundActions.deleteFunds({ fundIds: [1] }), fundServiceSpy);
      effects.deleteFunds$.subscribe(action => {
        expect(action).toEqual(FundActions.deleteFundsFailure({ error: 'Delete failed' }));
        done();
      });
    });
  });
});
