import { Component, OnInit, DestroyRef, Output, EventEmitter, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RootReducerState } from './engagement-state/reducers/index';
import { EngdetailsModel } from './engagement-state/models/engDetails';
import * as EngActions from './engagement-state/actions/eng-actions';

@Component({
  selector: 'app-engagement-details',
  templateUrl: './engagement-details.component.html',
  styleUrls: ['./engagement-details.component.scss'],
  standalone: false
})
export class EngagementDetailsComponent implements OnInit {
  engagementDetailsList: EngdetailsModel[] = [];
  successMessage = '';
  errorMessage = '';
  showSuccessAlert = false;
  showErrorAlert = false;
  @Output() editEngagement = new EventEmitter<EngdetailsModel>();

  private destroyRef = inject(DestroyRef);

  constructor(
    private store: Store<RootReducerState>
  ) {}

  ngOnInit(): void {
    // Dispatch action to load engagements from API
    this.store.dispatch(EngActions.loadEngDetails());

    // Subscribe to engagement details from store
    this.store.select(state => state.engDetails.entities)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result) {
          // If result is an array, use it directly; otherwise, wrap single object in array
          this.engagementDetailsList = Array.isArray(result) ? result : [result];
          console.log('Engagement List:', this.engagementDetailsList);
        } else {
          this.engagementDetailsList = [];
        }
      });

    // Subscribe to success messages
    this.store.select(state => state.engDetails.successMessage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(message => {
        if (message) {
          this.successMessage = message;
          this.showSuccessAlert = true;
          // Auto-hide alert after 3 seconds
          setTimeout(() => {
            this.closeAlert('success');
          }, 3000);
        }
      });

    // Subscribe to error messages
    this.store.select(state => state.engDetails.error)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(error => {
        if (error) {
          this.errorMessage = error;
          this.showErrorAlert = true;
          // Auto-hide alert after 3 seconds
          setTimeout(() => {
            this.closeAlert('error');
          }, 3000);
        }
      });
  }

  onEditEngagement(engagement: EngdetailsModel): void {
    // Store the engagement in store for edit mode
    this.store.dispatch(EngActions.setEditEngagement({ engagement }));
    // Emit event to parent component to switch to Add Engagement tab in edit mode
    this.editEngagement.emit(engagement);
  }

  onDeleteEngagement(engagementId: number): void {
    console.log('Delete Engagement ID:', engagementId);
    if (!engagementId) {
      this.errorMessage = 'Unable to delete: Engagement ID is missing';
      this.showErrorAlert = true;
      return;
    }
    if (confirm('Are you sure you want to delete this engagement?')) {
      this.store.dispatch(EngActions.deleteEngagement({ engagementId }));
    }
  }

  closeAlert(alertType: 'success' | 'error'): void {
    if (alertType === 'success') {
      this.showSuccessAlert = false;
      this.store.dispatch(EngActions.clearSuccessMessage());
    } else {
      this.showErrorAlert = false;
    }
  }
}

