import { createReducer, on } from '@ngrx/store';
import { FundState, FundLookups } from './fund.model';
import * as FundActions from './fund.actions';

const emptyLookups: FundLookups = {
  typeOfFunds: [],
  typeOfInvestments: [],
  fundAdministrators: [],
  brokerCustodians: [],
  reportingCurrencies: []
};

export const initialFundState: FundState = {
  funds: [],
  loading: false,
  saving: false,
  error: null,
  newlyAddedFundIds: [],
  lookups: emptyLookups
};

export const fundReducer = createReducer(
  initialFundState,
  on(FundActions.loadFunds, state => ({ ...state, loading: true, error: null })),
  on(FundActions.loadFundsSuccess, (state, { funds }) => ({ ...state, funds, loading: false })),
  on(FundActions.loadFundsFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(FundActions.loadLookupsSuccess, (state, { lookups }) => ({ ...state, lookups })),
  on(FundActions.addFund, state => ({ ...state, saving: true, error: null })),
  on(FundActions.addFundSuccess, state => ({ ...state, saving: false })),
  on(FundActions.addFundFailure, (state, { error }) => ({ ...state, saving: false, error })),
  on(FundActions.updateFund, state => ({ ...state, saving: true })),
  on(FundActions.updateFundSuccess, state => ({ ...state, saving: false })),
  on(FundActions.updateFundFailure, (state, { error }) => ({ ...state, saving: false, error })),
  on(FundActions.deleteFunds, state => ({ ...state, saving: true, error: null })),
  on(FundActions.deleteFundsSuccess, state => ({ ...state, saving: false })),
  on(FundActions.deleteFundsFailure, (state, { error }) => ({ ...state, saving: false, error })),
  on(FundActions.setNewlyAddedFundIds, (state, { fundIds }) => ({ ...state, newlyAddedFundIds: fundIds })),
  on(FundActions.clearNewlyAddedFundIds, state => ({ ...state, newlyAddedFundIds: [] }))
);
