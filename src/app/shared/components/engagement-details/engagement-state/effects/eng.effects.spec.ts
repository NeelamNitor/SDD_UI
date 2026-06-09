import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { EngagementDetailsEffects } from './eng.effects';
import { EngagementService } from '../../../../services/engagement/engagement.service';
import * as EngActions from '../actions/eng-actions';
import { EngdetailsModel } from '../models/engDetails';

function createEffects(action: Action, serviceSpy: jasmine.SpyObj<EngagementService>): EngagementDetailsEffects {
  const actions = new Actions(of(action) as Observable<Action>);
  return new EngagementDetailsEffects(actions, serviceSpy);
}

describe('EngagementDetailsEffects', () => {
  let serviceSpy: jasmine.SpyObj<EngagementService>;

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('EngagementService', ['getEngagements', 'deleteEngagement']);
  });

  describe('loadEngDetails$', () => {
    it('should dispatch loadEngDetailsSuccess with data on success', (done) => {
      const mockData: EngdetailsModel[] = [
        { engagementId: 1, engagementName: 'Engagement 1', periodEndDate: '2024-12-31' }
      ];
      serviceSpy.getEngagements.and.returnValue(of(mockData));

      const effects = createEffects(EngActions.loadEngDetails(), serviceSpy);
      effects.loadEngDetails$.subscribe(action => {
        expect(action).toEqual(EngActions.loadEngDetailsSuccess({ data: mockData }));
        done();
      });
    });

    it('should dispatch loadEngDetailsSuccess for multiple engagements', (done) => {
      const mockData: EngdetailsModel[] = [
        { engagementId: 1, engagementName: 'E1', periodEndDate: '2024-12-31' },
        { engagementId: 2, engagementName: 'E2', periodEndDate: '2025-06-30' }
      ];
      serviceSpy.getEngagements.and.returnValue(of(mockData));

      const effects = createEffects(EngActions.loadEngDetails(), serviceSpy);
      effects.loadEngDetails$.subscribe(action => {
        const result = action as ReturnType<typeof EngActions.loadEngDetailsSuccess>;
        expect(result.data.length).toBe(2);
        done();
      });
    });

    it('should dispatch loadEngDetailsFailure with error message on failure', (done) => {
      serviceSpy.getEngagements.and.returnValue(throwError(() => new Error('Network error')));

      const effects = createEffects(EngActions.loadEngDetails(), serviceSpy);
      effects.loadEngDetails$.subscribe(action => {
        expect(action).toEqual(EngActions.loadEngDetailsFailure({ error: 'Network error' }));
        done();
      });
    });

    it('should dispatch loadEngDetailsSuccess with empty array', (done) => {
      serviceSpy.getEngagements.and.returnValue(of([]));

      const effects = createEffects(EngActions.loadEngDetails(), serviceSpy);
      effects.loadEngDetails$.subscribe(action => {
        expect(action).toEqual(EngActions.loadEngDetailsSuccess({ data: [] }));
        done();
      });
    });
  });

  describe('deleteEngagement$', () => {
    it('should dispatch deleteEngagementSuccess with engagementId on success', (done) => {
      serviceSpy.deleteEngagement.and.returnValue(of({}));

      const effects = createEffects(EngActions.deleteEngagement({ engagementId: 3 }), serviceSpy);
      effects.deleteEngagement$.subscribe(action => {
        expect(action).toEqual(EngActions.deleteEngagementSuccess({ engagementId: 3 }));
        done();
      });
    });

    it('should call deleteEngagement service with the correct id', (done) => {
      serviceSpy.deleteEngagement.and.returnValue(of({}));

      const effects = createEffects(EngActions.deleteEngagement({ engagementId: 7 }), serviceSpy);
      effects.deleteEngagement$.subscribe(() => {
        expect(serviceSpy.deleteEngagement).toHaveBeenCalledWith(7);
        done();
      });
    });

    it('should dispatch deleteEngagementFailure with error message on failure', (done) => {
      serviceSpy.deleteEngagement.and.returnValue(throwError(() => new Error('Delete failed')));

      const effects = createEffects(EngActions.deleteEngagement({ engagementId: 3 }), serviceSpy);
      effects.deleteEngagement$.subscribe(action => {
        expect(action).toEqual(EngActions.deleteEngagementFailure({ error: 'Delete failed' }));
        done();
      });
    });
  });
});
