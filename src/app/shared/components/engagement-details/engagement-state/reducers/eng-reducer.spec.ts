import { engDetailReducer, initialState } from './eng-reducer';
import * as EngActions from '../actions/eng-actions';
import { EngdetailsModel } from '../models/engDetails';

describe('engDetailReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = engDetailReducer(undefined, { type: 'UNKNOWN' } as any);
    expect(state).toEqual(initialState);
  });

  it('initial state should have correct defaults', () => {
    expect(initialState.entities).toEqual([]);
    expect(initialState.loading).toBeFalse();
    expect(initialState.error).toBeNull();
    expect(initialState.editingEngagement).toBeNull();
    expect(initialState.successMessage).toBeNull();
    expect(initialState.showSuccessAlert).toBeFalse();
  });

  describe('loadEngDetails', () => {
    it('should set loading to true', () => {
      const state = engDetailReducer(initialState, EngActions.loadEngDetails());
      expect(state.loading).toBeTrue();
    });

    it('should clear existing error', () => {
      const state = engDetailReducer(
        { ...initialState, error: 'existing error' },
        EngActions.loadEngDetails()
      );
      expect(state.error).toBeNull();
    });
  });

  describe('loadEngDetailsSuccess', () => {
    it('should set entities and set loading false', () => {
      const data: EngdetailsModel[] = [{ engagementId: 1, engagementName: 'E1', periodEndDate: '2024-12-31' }];
      const state = engDetailReducer({ ...initialState, loading: true }, EngActions.loadEngDetailsSuccess({ data }));
      expect(state.entities).toEqual(data);
      expect(state.loading).toBeFalse();
      expect(state.error).toBeNull();
    });

    it('should wrap a single object in an array', () => {
      const data: any = { engagementId: 1, engagementName: 'E1', periodEndDate: '2024-12-31' };
      const state = engDetailReducer(initialState, EngActions.loadEngDetailsSuccess({ data }));
      expect(Array.isArray(state.entities)).toBeTrue();
      expect(state.entities!.length).toBe(1);
    });

    it('should replace existing entities', () => {
      const oldData: EngdetailsModel[] = [{ engagementId: 1, engagementName: 'Old', periodEndDate: '2024-01-01' }];
      const newData: EngdetailsModel[] = [{ engagementId: 2, engagementName: 'New', periodEndDate: '2024-06-30' }];
      const state = engDetailReducer(
        { ...initialState, entities: oldData },
        EngActions.loadEngDetailsSuccess({ data: newData })
      );
      expect(state.entities).toEqual(newData);
    });
  });

  describe('loadEngDetailsFailure', () => {
    it('should set error and set loading false', () => {
      const state = engDetailReducer(
        { ...initialState, loading: true },
        EngActions.loadEngDetailsFailure({ error: 'API error' })
      );
      expect(state.loading).toBeFalse();
      expect(state.error).toBe('API error');
    });
  });

  describe('updateEngDetails', () => {
    it('should append new engagement to entities', () => {
      const existing: EngdetailsModel = { engagementId: 1, engagementName: 'E1', periodEndDate: '2024-01-01' };
      const newEng: EngdetailsModel = { engagementId: 2, engagementName: 'E2', periodEndDate: '2024-06-30' };
      const state = engDetailReducer(
        { ...initialState, entities: [existing] },
        EngActions.updateEngDetails({ data: newEng })
      );
      expect(state.entities!.length).toBe(2);
      expect(state.entities).toContain(newEng);
    });

    it('should work when entities is initially empty', () => {
      const eng: EngdetailsModel = { engagementId: 1, engagementName: 'E1', periodEndDate: '2024-01-01' };
      const state = engDetailReducer(initialState, EngActions.updateEngDetails({ data: eng }));
      expect(state.entities!.length).toBe(1);
    });
  });

  describe('deleteEngagementSuccess', () => {
    it('should remove the deleted engagement from entities', () => {
      const entities: EngdetailsModel[] = [
        { engagementId: 1, engagementName: 'E1', periodEndDate: '2024-01-01' },
        { engagementId: 2, engagementName: 'E2', periodEndDate: '2024-06-30' }
      ];
      const state = engDetailReducer(
        { ...initialState, entities },
        EngActions.deleteEngagementSuccess({ engagementId: 1 })
      );
      expect(state.entities!.length).toBe(1);
      expect(state.entities![0].engagementId).toBe(2);
    });

    it('should set successMessage', () => {
      const state = engDetailReducer(
        { ...initialState, entities: [{ engagementId: 1, engagementName: 'E1', periodEndDate: '2024-01-01' }] },
        EngActions.deleteEngagementSuccess({ engagementId: 1 })
      );
      expect(state.successMessage).toBe('Engagement deleted successfully!');
    });

    it('should set showSuccessAlert to true', () => {
      const state = engDetailReducer(
        { ...initialState, entities: [{ engagementId: 1, engagementName: 'E1', periodEndDate: '2024-01-01' }] },
        EngActions.deleteEngagementSuccess({ engagementId: 1 })
      );
      expect(state.showSuccessAlert).toBeTrue();
    });

    it('should handle empty entities gracefully', () => {
      const state = engDetailReducer(
        { ...initialState, entities: null },
        EngActions.deleteEngagementSuccess({ engagementId: 1 })
      );
      expect(state.entities).toEqual([]);
    });
  });

  describe('deleteEngagementFailure', () => {
    it('should set error', () => {
      const state = engDetailReducer(initialState, EngActions.deleteEngagementFailure({ error: 'Delete failed' }));
      expect(state.error).toBe('Delete failed');
    });

    it('should set showSuccessAlert to false', () => {
      const state = engDetailReducer(
        { ...initialState, showSuccessAlert: true },
        EngActions.deleteEngagementFailure({ error: 'Delete failed' })
      );
      expect(state.showSuccessAlert).toBeFalse();
    });
  });

  describe('setEditEngagement', () => {
    it('should set editingEngagement', () => {
      const engagement: EngdetailsModel = { engagementId: 3, engagementName: 'E3', periodEndDate: '2024-09-30' };
      const state = engDetailReducer(initialState, EngActions.setEditEngagement({ engagement }));
      expect(state.editingEngagement).toEqual(engagement);
    });
  });

  describe('clearEditEngagement', () => {
    it('should set editingEngagement to null', () => {
      const engagement: EngdetailsModel = { engagementId: 3, engagementName: 'E3', periodEndDate: '2024-09-30' };
      const state = engDetailReducer(
        { ...initialState, editingEngagement: engagement },
        EngActions.clearEditEngagement()
      );
      expect(state.editingEngagement).toBeNull();
    });
  });

  describe('clearSuccessMessage', () => {
    it('should clear successMessage', () => {
      const state = engDetailReducer(
        { ...initialState, successMessage: 'Done!', showSuccessAlert: true },
        EngActions.clearSuccessMessage()
      );
      expect(state.successMessage).toBeNull();
    });

    it('should set showSuccessAlert to false', () => {
      const state = engDetailReducer(
        { ...initialState, successMessage: 'Done!', showSuccessAlert: true },
        EngActions.clearSuccessMessage()
      );
      expect(state.showSuccessAlert).toBeFalse();
    });
  });
});
