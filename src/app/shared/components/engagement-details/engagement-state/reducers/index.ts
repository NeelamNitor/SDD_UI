import { ActionReducerMap } from '@ngrx/store';
import { EngagementDetailsState } from '../models/engDetails';
import { engDetailReducer } from './eng-reducer';

export interface RootReducerState {
  engDetails: EngagementDetailsState;
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
  engDetails: engDetailReducer
};
