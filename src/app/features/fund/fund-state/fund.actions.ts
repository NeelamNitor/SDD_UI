import { createAction, props } from '@ngrx/store';
import { Fund, FundLookups, FundSaveRequest, FundResponse, DeleteFundsResponse } from './fund.model';

export const loadFunds = createAction('[Fund] Load Funds', props<{ engagementId: number }>());
export const loadFundsSuccess = createAction('[Fund] Load Funds Success', props<{ funds: Fund[] }>());
export const loadFundsFailure = createAction('[Fund] Load Funds Failure', props<{ error: string }>());

export const loadLookups = createAction('[Fund] Load Lookups');
export const loadLookupsSuccess = createAction('[Fund] Load Lookups Success', props<{ lookups: FundLookups }>());

export const addFund = createAction('[Fund] Add Fund', props<{ row: FundSaveRequest }>());
export const addFundSuccess = createAction('[Fund] Add Fund Success', props<{ response: FundResponse }>());
export const addFundFailure = createAction('[Fund] Add Fund Failure', props<{ error: string }>());

export const updateFund = createAction('[Fund] Update Fund', props<{ fundId: number; row: FundSaveRequest }>());
export const updateFundSuccess = createAction('[Fund] Update Fund Success', props<{ response: FundResponse }>());
export const updateFundFailure = createAction('[Fund] Update Fund Failure', props<{ error: string }>());

export const deleteFunds = createAction('[Fund] Delete Funds', props<{ fundIds: number[] }>());
export const deleteFundsSuccess = createAction('[Fund] Delete Funds Success', props<{ response: DeleteFundsResponse }>());
export const deleteFundsFailure = createAction('[Fund] Delete Funds Failure', props<{ error: string }>());

export const setNewlyAddedFundIds = createAction('[Fund] Set Newly Added Fund IDs', props<{ fundIds: number[] }>());
export const clearNewlyAddedFundIds = createAction('[Fund] Clear Newly Added Fund IDs');
