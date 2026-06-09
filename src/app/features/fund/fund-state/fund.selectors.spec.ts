import {
  selectFunds,
  selectFundLoading,
  selectFundSaving,
  selectFundError,
  selectNewlyAddedFundIds,
  selectLookups
} from './fund.selectors';
import { FundState, FundLookups, Fund } from './fund.model';

describe('Fund Selectors', () => {
  const mockFund: Fund = {
    fundId: 1, engagementId: 1, fundName: 'Fund Alpha', typeOfFundId: 1,
    typesOfInvestmentIds: [2], fundAdministratorId: 1, brokerCustodianIds: [3],
    reportingCurrencyId: 1, periodBeginDate: '2024-01-01', periodEndDate: '2024-12-31',
    expectedAuditSignOffDate: '2025-01-15', status: 'Active'
  };

  const mockLookups: FundLookups = {
    typeOfFunds: [{ id: 1, name: 'Hedge Fund' }],
    typeOfInvestments: [{ id: 2, name: 'Equity' }],
    fundAdministrators: [{ id: 1, name: 'Admin Corp' }],
    brokerCustodians: [{ id: 3, name: 'Broker Inc' }],
    reportingCurrencies: [{ id: 1, name: 'USD' }]
  };

  const mockFundState: FundState = {
    funds: [mockFund],
    loading: true,
    saving: true,
    error: 'Some error',
    newlyAddedFundIds: [5, 6],
    lookups: mockLookups
  };

  const appState = { fund: mockFundState };

  describe('selectFunds', () => {
    it('should return the funds array', () => {
      expect(selectFunds(appState)).toEqual([mockFund]);
    });

    it('should return empty array when no funds', () => {
      expect(selectFunds({ fund: { ...mockFundState, funds: [] } })).toEqual([]);
    });
  });

  describe('selectFundLoading', () => {
    it('should return true when loading', () => {
      expect(selectFundLoading(appState)).toBeTrue();
    });

    it('should return false when not loading', () => {
      expect(selectFundLoading({ fund: { ...mockFundState, loading: false } })).toBeFalse();
    });
  });

  describe('selectFundSaving', () => {
    it('should return true when saving', () => {
      expect(selectFundSaving(appState)).toBeTrue();
    });

    it('should return false when not saving', () => {
      expect(selectFundSaving({ fund: { ...mockFundState, saving: false } })).toBeFalse();
    });
  });

  describe('selectFundError', () => {
    it('should return the error string', () => {
      expect(selectFundError(appState)).toBe('Some error');
    });

    it('should return null when no error', () => {
      expect(selectFundError({ fund: { ...mockFundState, error: null } })).toBeNull();
    });
  });

  describe('selectNewlyAddedFundIds', () => {
    it('should return the newlyAddedFundIds array', () => {
      expect(selectNewlyAddedFundIds(appState)).toEqual([5, 6]);
    });

    it('should return empty array when no newly added funds', () => {
      expect(selectNewlyAddedFundIds({ fund: { ...mockFundState, newlyAddedFundIds: [] } })).toEqual([]);
    });
  });

  describe('selectLookups', () => {
    it('should return the full lookups object', () => {
      expect(selectLookups(appState)).toEqual(mockLookups);
    });

    it('should return typeOfFunds from lookups', () => {
      const lookups = selectLookups(appState);
      expect(lookups.typeOfFunds).toEqual([{ id: 1, name: 'Hedge Fund' }]);
    });

    it('should return reportingCurrencies from lookups', () => {
      const lookups = selectLookups(appState);
      expect(lookups.reportingCurrencies).toEqual([{ id: 1, name: 'USD' }]);
    });
  });
});
