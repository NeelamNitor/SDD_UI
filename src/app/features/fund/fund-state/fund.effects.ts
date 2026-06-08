import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FundService } from '../../../shared/services/fund/fund.service';
import * as FundActions from './fund.actions';
import { FundLookups } from './fund.model';

@Injectable()
export class FundEffects {
  loadFunds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FundActions.loadFunds),
      switchMap(({ engagementId }) =>
        this.fundService.getFunds(engagementId).pipe(
          map(funds => FundActions.loadFundsSuccess({ funds })),
          catchError(error => of(FundActions.loadFundsFailure({ error: error?.message ?? 'Failed to load funds' })))
        )
      )
    )
  );

  loadLookups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FundActions.loadLookups),
      switchMap(() =>
        forkJoin({
          typeOfFunds: this.fundService.getTypeOfFunds(),
          typeOfInvestments: this.fundService.getTypeOfInvestments(),
          fundAdministrators: this.fundService.getFundAdministrators(),
          brokerCustodians: this.fundService.getBrokerCustodians(),
          reportingCurrencies: this.fundService.getReportingCurrencies()
        }).pipe(
          map((lookups: FundLookups) => FundActions.loadLookupsSuccess({ lookups })),
          catchError(() => of(FundActions.loadLookupsSuccess({
            lookups: { typeOfFunds: [], typeOfInvestments: [], fundAdministrators: [], brokerCustodians: [], reportingCurrencies: [] }
          })))
        )
      )
    )
  );

  deleteFunds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FundActions.deleteFunds),
      switchMap(({ fundIds }) =>
        this.fundService.deleteFunds(fundIds).pipe(
          map(response => FundActions.deleteFundsSuccess({ response })),
          catchError(error => of(FundActions.deleteFundsFailure({ error: error?.message ?? 'Delete failed' })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private fundService: FundService
  ) {}
}
