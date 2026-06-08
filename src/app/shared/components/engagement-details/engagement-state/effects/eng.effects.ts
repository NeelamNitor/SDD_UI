import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EngagementService } from '../../../../services/engagement/engagement.service';
import * as EngActions from '../actions/eng-actions';

@Injectable()
export class EngagementDetailsEffects {
  loadEngDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EngActions.loadEngDetails),
      switchMap(() =>
        this.engagementService.getEngagements().pipe(
          map(data => {
            console.log('API Response Data:', data);
            if (data && data.length > 0) {
              console.log('First item structure:', data[0]);
            }
            return EngActions.loadEngDetailsSuccess({ data });
          }),
          catchError(error =>
            of(EngActions.loadEngDetailsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteEngagement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EngActions.deleteEngagement),
      switchMap(({ engagementId }) => {
        console.log('Delete Effect - Engagement ID:', engagementId);
        return this.engagementService.deleteEngagement(engagementId).pipe(
          map(() => {
            console.log('Delete Success for ID:', engagementId);
            return EngActions.deleteEngagementSuccess({ engagementId });
          }),
          catchError(error => {
            console.error('Delete Error:', error);
            return of(EngActions.deleteEngagementFailure({ error: error.message }));
          })
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private engagementService: EngagementService
  ) {}
}

