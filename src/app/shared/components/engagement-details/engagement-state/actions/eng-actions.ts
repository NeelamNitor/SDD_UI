import { createAction, props } from '@ngrx/store';
import { EngdetailsModel } from '../models/engDetails';

export const ENGDETAILS_UPDATE = '[Engagement Details] Update';
export const ENGDETAILS_LOAD = '[Engagement Details] Load';
export const ENGDETAILS_LOAD_SUCCESS = '[Engagement Details] Load Success';
export const ENGDETAILS_LOAD_FAILURE = '[Engagement Details] Load Failure';
export const ENGDETAILS_DELETE = '[Engagement Details] Delete';
export const ENGDETAILS_DELETE_SUCCESS = '[Engagement Details] Delete Success';
export const ENGDETAILS_DELETE_FAILURE = '[Engagement Details] Delete Failure';
export const ENGDETAILS_SET_EDIT = '[Engagement Details] Set Edit';
export const ENGDETAILS_CLEAR_EDIT = '[Engagement Details] Clear Edit';
export const ENGDETAILS_CLEAR_SUCCESS = '[Engagement Details] Clear Success Message';

export const updateEngDetails = createAction(
  ENGDETAILS_UPDATE,
  props<{ data: EngdetailsModel }>()
);

export const loadEngDetails = createAction(
  ENGDETAILS_LOAD
);

export const loadEngDetailsSuccess = createAction(
  ENGDETAILS_LOAD_SUCCESS,
  props<{ data: EngdetailsModel[] }>()
);

export const loadEngDetailsFailure = createAction(
  ENGDETAILS_LOAD_FAILURE,
  props<{ error: string }>()
);

export const deleteEngagement = createAction(
  ENGDETAILS_DELETE,
  props<{ engagementId: number }>()
);

export const deleteEngagementSuccess = createAction(
  ENGDETAILS_DELETE_SUCCESS,
  props<{ engagementId: number }>()
);

export const deleteEngagementFailure = createAction(
  ENGDETAILS_DELETE_FAILURE,
  props<{ error: string }>()
);

export const setEditEngagement = createAction(
  ENGDETAILS_SET_EDIT,
  props<{ engagement: EngdetailsModel }>()
);

export const clearEditEngagement = createAction(
  ENGDETAILS_CLEAR_EDIT
);

export const clearSuccessMessage = createAction(
  ENGDETAILS_CLEAR_SUCCESS
);

