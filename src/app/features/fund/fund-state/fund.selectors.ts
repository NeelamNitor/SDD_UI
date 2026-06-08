import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FundState } from './fund.model';

export const selectFundState = createFeatureSelector<FundState>('fund');

export const selectFunds = createSelector(selectFundState, s => s.funds);
export const selectFundLoading = createSelector(selectFundState, s => s.loading);
export const selectFundSaving = createSelector(selectFundState, s => s.saving);
export const selectFundError = createSelector(selectFundState, s => s.error);
export const selectNewlyAddedFundIds = createSelector(selectFundState, s => s.newlyAddedFundIds);
export const selectLookups = createSelector(selectFundState, s => s.lookups);
