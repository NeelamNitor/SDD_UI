import { fundReducer, initialFundState } from './fund.reducer';
import * as FundActions from './fund.actions';
import { Fund, FundLookups } from './fund.model';

const mockFund: Fund = {
  fundId: 1, engagementId: 1, fundName: 'Fund Alpha', typeOfFundId: 1,
  typesOfInvestmentIds: [2], fundAdministratorId: 1, brokerCustodianIds: [3],
  reportingCurrencyId: 1, periodBeginDate: '2024-01-01', periodEndDate: '2024-12-31',
  expectedAuditSignOffDate: '2025-01-15', status: 'Active'
};

const mockLookups: FundLookups = {
  typeOfFunds: [{ id: 1, name: 'Hedge' }],
  typeOfInvestments: [{ id: 2, name: 'Equity' }],
  fundAdministrators: [{ id: 1, name: 'Admin Corp' }],
  brokerCustodians: [{ id: 3, name: 'Broker Inc' }],
  reportingCurrencies: [{ id: 1, name: 'USD' }]
};

const mockRow = {
  engagementId: 1, fundName: 'F', typeOfFundId: 1, typesOfInvestmentIds: [],
  fundAdministratorId: 1, brokerCustodianIds: [], reportingCurrencyId: 1,
  periodBeginDate: '2024-01-01', periodEndDate: '2024-12-31', expectedAuditSignOffDate: '2025-01-15'
};

describe('fundReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = fundReducer(undefined, { type: 'UNKNOWN' } as any);
    expect(state).toEqual(initialFundState);
  });

  it('initial state should have correct defaults', () => {
    expect(initialFundState.funds).toEqual([]);
    expect(initialFundState.loading).toBeFalse();
    expect(initialFundState.saving).toBeFalse();
    expect(initialFundState.error).toBeNull();
    expect(initialFundState.newlyAddedFundIds).toEqual([]);
  });

  describe('loadFunds', () => {
    it('should set loading true and clear error', () => {
      const state = fundReducer({ ...initialFundState, error: 'old' }, FundActions.loadFunds({ engagementId: 1 }));
      expect(state.loading).toBeTrue();
      expect(state.error).toBeNull();
    });
  });

  describe('loadFundsSuccess', () => {
    it('should set funds and set loading false', () => {
      const state = fundReducer(
        { ...initialFundState, loading: true },
        FundActions.loadFundsSuccess({ funds: [mockFund] })
      );
      expect(state.funds).toEqual([mockFund]);
      expect(state.loading).toBeFalse();
    });

    it('should replace existing funds', () => {
      const state = fundReducer(
        { ...initialFundState, funds: [mockFund] },
        FundActions.loadFundsSuccess({ funds: [] })
      );
      expect(state.funds).toEqual([]);
    });
  });

  describe('loadFundsFailure', () => {
    it('should set error and loading false', () => {
      const state = fundReducer(
        { ...initialFundState, loading: true },
        FundActions.loadFundsFailure({ error: 'Load error' })
      );
      expect(state.loading).toBeFalse();
      expect(state.error).toBe('Load error');
    });
  });

  describe('loadLookupsSuccess', () => {
    it('should set lookups', () => {
      const state = fundReducer(initialFundState, FundActions.loadLookupsSuccess({ lookups: mockLookups }));
      expect(state.lookups).toEqual(mockLookups);
    });
  });

  describe('addFund', () => {
    it('should set saving true and clear error', () => {
      const state = fundReducer(
        { ...initialFundState, error: 'prev error' },
        FundActions.addFund({ row: mockRow })
      );
      expect(state.saving).toBeTrue();
      expect(state.error).toBeNull();
    });
  });

  describe('addFundSuccess', () => {
    it('should set saving false', () => {
      const state = fundReducer(
        { ...initialFundState, saving: true },
        FundActions.addFundSuccess({ response: { success: true, message: 'Created', fundId: 1 } })
      );
      expect(state.saving).toBeFalse();
    });
  });

  describe('addFundFailure', () => {
    it('should set saving false and set error', () => {
      const state = fundReducer(
        { ...initialFundState, saving: true },
        FundActions.addFundFailure({ error: 'Add failed' })
      );
      expect(state.saving).toBeFalse();
      expect(state.error).toBe('Add failed');
    });
  });

  describe('updateFund', () => {
    it('should set saving true', () => {
      const state = fundReducer(initialFundState, FundActions.updateFund({ fundId: 1, row: mockRow }));
      expect(state.saving).toBeTrue();
    });
  });

  describe('updateFundSuccess', () => {
    it('should set saving false', () => {
      const state = fundReducer(
        { ...initialFundState, saving: true },
        FundActions.updateFundSuccess({ response: { success: true, message: 'Updated', fundId: 1 } })
      );
      expect(state.saving).toBeFalse();
    });
  });

  describe('updateFundFailure', () => {
    it('should set saving false and set error', () => {
      const state = fundReducer(
        { ...initialFundState, saving: true },
        FundActions.updateFundFailure({ error: 'Update failed' })
      );
      expect(state.saving).toBeFalse();
      expect(state.error).toBe('Update failed');
    });
  });

  describe('deleteFunds', () => {
    it('should set saving true and clear error', () => {
      const state = fundReducer(
        { ...initialFundState, error: 'old error' },
        FundActions.deleteFunds({ fundIds: [1, 2] })
      );
      expect(state.saving).toBeTrue();
      expect(state.error).toBeNull();
    });
  });

  describe('deleteFundsSuccess', () => {
    it('should set saving false', () => {
      const state = fundReducer(
        { ...initialFundState, saving: true },
        FundActions.deleteFundsSuccess({ response: { deleted: [1], skipped: [] } })
      );
      expect(state.saving).toBeFalse();
    });
  });

  describe('deleteFundsFailure', () => {
    it('should set saving false and set error', () => {
      const state = fundReducer(
        { ...initialFundState, saving: true },
        FundActions.deleteFundsFailure({ error: 'Delete failed' })
      );
      expect(state.saving).toBeFalse();
      expect(state.error).toBe('Delete failed');
    });
  });

  describe('setNewlyAddedFundIds', () => {
    it('should set newlyAddedFundIds', () => {
      const state = fundReducer(initialFundState, FundActions.setNewlyAddedFundIds({ fundIds: [10, 11] }));
      expect(state.newlyAddedFundIds).toEqual([10, 11]);
    });

    it('should replace existing newlyAddedFundIds', () => {
      const state = fundReducer(
        { ...initialFundState, newlyAddedFundIds: [5] },
        FundActions.setNewlyAddedFundIds({ fundIds: [10, 11] })
      );
      expect(state.newlyAddedFundIds).toEqual([10, 11]);
    });
  });

  describe('clearNewlyAddedFundIds', () => {
    it('should reset newlyAddedFundIds to empty array', () => {
      const state = fundReducer(
        { ...initialFundState, newlyAddedFundIds: [10, 11] },
        FundActions.clearNewlyAddedFundIds()
      );
      expect(state.newlyAddedFundIds).toEqual([]);
    });
  });
});
