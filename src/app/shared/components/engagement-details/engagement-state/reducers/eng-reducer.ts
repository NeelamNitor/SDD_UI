import { createReducer, on } from '@ngrx/store';
import { EngagementDetailsState, EngdetailsModel } from '../models/engDetails';
import * as EngActions from '../actions/eng-actions';

export const initialState: EngagementDetailsState = {
  entities: [],
  loading: false,
  error: null,
  editingEngagement: null,
  successMessage: null,
  showSuccessAlert: false
};

export const engDetailReducer = createReducer(
  initialState,
  on(EngActions.loadEngDetails, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EngActions.updateEngDetails, (state, { data }) => {
    const currentList = Array.isArray(state.entities) ? state.entities : [];
    const newList = [...currentList, data];
    sessionStorage.setItem("engDetails", JSON.stringify(newList));
    return {
      ...state,
      entities: newList,
      loading: false,
      error: null
    };
  }),
  on(EngActions.loadEngDetailsSuccess, (state, { data }) => {
    const dataList = Array.isArray(data) ? data : [data];
    sessionStorage.setItem("engDetails", JSON.stringify(dataList));
    return {
      ...state,
      entities: dataList,
      loading: false,
      error: null
    };
  }),
  on(EngActions.loadEngDetailsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(EngActions.deleteEngagementSuccess, (state, { engagementId }) => {
    const updatedList = state.entities ? (state.entities as EngdetailsModel[]).filter(
      (eng) => eng.engagementId !== engagementId
    ) : [];
    sessionStorage.setItem("engDetails", JSON.stringify(updatedList));
    return {
      ...state,
      entities: updatedList,
      loading: false,
      error: null,
      successMessage: 'Engagement deleted successfully!',
      showSuccessAlert: true
    };
  }),
  on(EngActions.deleteEngagementFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    showSuccessAlert: false
  })),
  on(EngActions.setEditEngagement, (state, { engagement }) => ({
    ...state,
    editingEngagement: engagement
  })),
  on(EngActions.clearEditEngagement, (state) => ({
    ...state,
    editingEngagement: null
  })),
  on(EngActions.clearSuccessMessage, (state) => ({
    ...state,
    successMessage: null,
    showSuccessAlert: false
  }))
);

export function reducer(state: EngagementDetailsState | undefined, action: any) {
  return engDetailReducer(state, action);
}

