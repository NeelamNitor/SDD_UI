import { Component, OnInit, ViewChild, ElementRef, DestroyRef, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Fund, FundLookups, FundSaveRequest } from '../../fund-state/fund.model';
import * as FundActions from '../../fund-state/fund.actions';
import {
  selectFunds, selectFundLoading, selectFundError,
  selectLookups, selectNewlyAddedFundIds
} from '../../fund-state/fund.selectors';
import { FundScopingGridComponent } from '../../components/fund-scoping-grid/fund-scoping-grid.component';
import { FundService } from '../../../../shared/services/fund/fund.service';

@Component({
  selector: 'app-fund-scoping-page',
  templateUrl: './fund-scoping-page.component.html',
  styleUrls: ['./fund-scoping-page.component.scss'],
  standalone: false
})
export class FundScopingPageComponent implements OnInit {
  @ViewChild(FundScopingGridComponent) gridRef!: FundScopingGridComponent;
  @ViewChild('backModal') backModalEl!: ElementRef;

  funds$!: Observable<Fund[]>;
  lookups$!: Observable<FundLookups>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  newlyAddedFundIds$!: Observable<number[]>;

  rowCount = 0;
  selectedIds: number[] = [];
  isDirty = false;
  saving = false;

  successMessage = '';
  errorMessage = '';
  infoMessage = '';

  readonly MAX_FUNDS = 15;

  private engagementId = 0;
  private destroyRef = inject(DestroyRef);
  private bsBackModal: any = null;

  constructor(
    private store: Store,
    private fundService: FundService,
    private actions$: Actions
  ) {}

  ngOnInit(): void {
    this.funds$ = this.store.select(selectFunds);
    this.lookups$ = this.store.select(selectLookups);
    this.loading$ = this.store.select(selectFundLoading);
    this.error$ = this.store.select(selectFundError);
    this.newlyAddedFundIds$ = this.store.select(selectNewlyAddedFundIds);

    // Get engagementId from session or store
    const stored = sessionStorage.getItem('engDetails');
    if (stored) {
      const list = JSON.parse(stored);
      this.engagementId = list?.[0]?.engagementId ?? 0;
    }

    this.store.dispatch(FundActions.loadFunds({ engagementId: this.engagementId }));
    this.store.dispatch(FundActions.loadLookups());
  }

  onAddFund(): void {
    if (this.rowCount >= this.MAX_FUNDS) return;
    this.gridRef.addRow();
    this.clearMessages();
    this.store.dispatch(FundActions.clearNewlyAddedFundIds());
  }

  onDuplicateFund(): void {
    if (this.selectedIds.length !== 1 || this.rowCount >= this.MAX_FUNDS) return;
    this.gridRef.duplicateSelected();
    this.clearMessages();
    this.store.dispatch(FundActions.clearNewlyAddedFundIds());
  }

  onDeleteFund(): void {
    if (this.selectedIds.length === 0) return;
    this.clearMessages();
    this.store.dispatch(FundActions.clearNewlyAddedFundIds());

    // Remove any unsaved new rows from selectedIds (they have no fundId)
    const savedIds = this.selectedIds.filter(id => typeof id === 'number' && id > 0);
    const newRowCount = this.selectedIds.length - savedIds.length;

    // Remove unsaved rows from grid directly
    if (newRowCount > 0) {
      this.gridRef.removeUnsavedSelected();
    }

    if (savedIds.length === 0) return;

    this.store.dispatch(FundActions.deleteFunds({ fundIds: savedIds }));

    this.actions$.pipe(
      ofType(FundActions.deleteFundsSuccess),
      take(1),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ response }) => this.onDeleteSuccess(response));

    this.actions$.pipe(
      ofType(FundActions.deleteFundsFailure),
      take(1),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => { this.errorMessage = 'Delete failed. Please try again.'; });
  }

  onSave(): void {
    if (!this.gridRef) return;
    this.clearMessages();

    if (!this.gridRef.isValid()) {
      this.errorMessage = 'Please fix validation errors before saving.';
      return;
    }

    const newRows = this.gridRef.getNewRowValues();
    if (newRows.length === 0) {
      this.successMessage = 'No new funds to save.';
      return;
    }

    this.saving = true;
    forkJoin(newRows.map((row: FundSaveRequest) => this.fundService.addFund(row)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: responses => {
          this.saving = false;
          const newIds = responses.map(r => r.fundId).filter(Boolean);
          this.store.dispatch(FundActions.setNewlyAddedFundIds({ fundIds: newIds }));
          this.gridRef.clearNewRows();
          this.store.dispatch(FundActions.loadFunds({ engagementId: this.engagementId }));
          this.successMessage = `${responses.length} fund(s) saved successfully.`;
        },
        error: () => {
          this.saving = false;
          this.errorMessage = 'Fund could not be saved. Please try again.';
        }
      });
  }

  onBack(): void {
    if (this.isDirty) {
      if (!this.bsBackModal) {
        this.bsBackModal = new (window as any).bootstrap.Modal(this.backModalEl.nativeElement);
      }
      this.bsBackModal.show();
      return;
    }
    this.store.dispatch(FundActions.clearNewlyAddedFundIds());
    window.history.back();
  }

  confirmBack(): void {
    this.bsBackModal?.hide();
    this.store.dispatch(FundActions.clearNewlyAddedFundIds());
    window.history.back();
  }

  onDeleteSuccess(response: any): void {
    if (response?.skipped?.length > 0) {
      const names = response.skipped.map((s: any) => s.name).join(', ');
      this.infoMessage = `The following fund(s) could not be deleted (past Data Import stage): ${names}.`;
    }
    this.store.dispatch(FundActions.loadFunds({ engagementId: this.engagementId }));
  }

  onRowCountChange(count: number): void {
    this.rowCount = count;
  }

  onSelectedIdsChange(ids: number[]): void {
    this.selectedIds = ids;
  }

  onDirtyChange(dirty: boolean): void {
    this.isDirty = dirty;
  }

  onClearMessages(): void {
    this.clearMessages();
    this.store.dispatch(FundActions.clearNewlyAddedFundIds());
  }

  get canAdd(): boolean { return this.rowCount < this.MAX_FUNDS; }
  get canDuplicate(): boolean { return this.selectedIds.length === 1 && this.rowCount < this.MAX_FUNDS; }
  get canDelete(): boolean { return this.selectedIds.length > 0; }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.infoMessage = '';
  }
}
