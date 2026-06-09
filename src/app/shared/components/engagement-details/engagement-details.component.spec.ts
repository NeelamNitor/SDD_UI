import { Injector, runInInjectionContext, DestroyRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { fakeAsync, tick } from '@angular/core/testing';
import { EngagementDetailsComponent } from './engagement-details.component';
import * as EngActions from './engagement-state/actions/eng-actions';
import { EngdetailsModel } from './engagement-state/models/engDetails';

describe('EngagementDetailsComponent', () => {
  let component: EngagementDetailsComponent;
  let mockStore: jasmine.SpyObj<Store<any>>;
  let stateSubject: BehaviorSubject<any>;

  const mockDestroyRef: DestroyRef = { onDestroy: (_cb: () => void) => () => {} } as any;

  const baseState = {
    engDetails: {
      entities: [],
      loading: false,
      error: null,
      editingEngagement: null,
      successMessage: null,
      showSuccessAlert: false
    }
  };

  function createComponent(): EngagementDetailsComponent {
    stateSubject = new BehaviorSubject<any>(baseState);
    mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    mockStore.select.and.callFake((selector: any) =>
      stateSubject.pipe(map((state: any) => selector(state)))
    );

    const injector = Injector.create({
      providers: [
        { provide: DestroyRef, useValue: mockDestroyRef },
        { provide: Store, useValue: mockStore }
      ]
    });

    let comp!: EngagementDetailsComponent;
    runInInjectionContext(injector, () => {
      comp = new EngagementDetailsComponent(mockStore as any);
    });
    return comp;
  }

  beforeEach(() => {
    component = createComponent();
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should dispatch loadEngDetails on init', () => {
      expect(mockStore.dispatch).toHaveBeenCalledWith(EngActions.loadEngDetails());
    });

    it('should set engagementDetailsList from store entities array', () => {
      const engagements: EngdetailsModel[] = [
        { engagementId: 1, engagementName: 'Eng 1', periodEndDate: '2024-12-31' }
      ];
      stateSubject.next({ engDetails: { ...baseState.engDetails, entities: engagements } });
      expect(component.engagementDetailsList).toEqual(engagements);
    });

    it('should set engagementDetailsList to empty array when entities is null', () => {
      stateSubject.next({ engDetails: { ...baseState.engDetails, entities: null } });
      expect(component.engagementDetailsList).toEqual([]);
    });

    it('should wrap single non-array object in array', () => {
      const single: any = { engagementId: 1, engagementName: 'Single', periodEndDate: '2024-01-01' };
      stateSubject.next({ engDetails: { ...baseState.engDetails, entities: single } });
      expect(Array.isArray(component.engagementDetailsList)).toBeTrue();
      expect(component.engagementDetailsList.length).toBe(1);
    });

    it('should show success alert when successMessage arrives from store', fakeAsync(() => {
      stateSubject.next({ engDetails: { ...baseState.engDetails, successMessage: 'Deleted!' } });
      expect(component.showSuccessAlert).toBeTrue();
      expect(component.successMessage).toBe('Deleted!');
      tick(3000);
      expect(component.showSuccessAlert).toBeFalse();
    }));

    it('should show error alert when error arrives from store', fakeAsync(() => {
      stateSubject.next({ engDetails: { ...baseState.engDetails, error: 'Something failed' } });
      expect(component.showErrorAlert).toBeTrue();
      expect(component.errorMessage).toBe('Something failed');
      tick(3000);
      expect(component.showErrorAlert).toBeFalse();
    }));
  });

  describe('onEditEngagement', () => {
    it('should dispatch setEditEngagement with the engagement', () => {
      const engagement: EngdetailsModel = { engagementId: 2, engagementName: 'Edit Me', periodEndDate: '2024-06-30' };
      component.onEditEngagement(engagement);
      expect(mockStore.dispatch).toHaveBeenCalledWith(EngActions.setEditEngagement({ engagement }));
    });

    it('should emit editEngagement event', () => {
      const engagement: EngdetailsModel = { engagementId: 2, engagementName: 'Edit Me', periodEndDate: '2024-06-30' };
      spyOn(component.editEngagement, 'emit');
      component.onEditEngagement(engagement);
      expect(component.editEngagement.emit).toHaveBeenCalledWith(engagement);
    });
  });

  describe('onDeleteEngagement', () => {
    it('should show error when engagementId is 0', () => {
      component.onDeleteEngagement(0);
      expect(component.showErrorAlert).toBeTrue();
      expect(component.errorMessage).toBe('Unable to delete: Engagement ID is missing');
    });

    it('should not dispatch delete when engagementId is falsy', () => {
      component.onDeleteEngagement(0);
      expect(mockStore.dispatch).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ type: EngActions.ENGDETAILS_DELETE })
      );
    });

    it('should dispatch deleteEngagement when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onDeleteEngagement(5);
      expect(mockStore.dispatch).toHaveBeenCalledWith(EngActions.deleteEngagement({ engagementId: 5 }));
    });

    it('should not dispatch deleteEngagement when user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.onDeleteEngagement(5);
      expect(mockStore.dispatch).not.toHaveBeenCalledWith(
        EngActions.deleteEngagement({ engagementId: 5 })
      );
    });
  });

  describe('closeAlert', () => {
    it('should hide success alert and dispatch clearSuccessMessage', () => {
      component.showSuccessAlert = true;
      component.closeAlert('success');
      expect(component.showSuccessAlert).toBeFalse();
      expect(mockStore.dispatch).toHaveBeenCalledWith(EngActions.clearSuccessMessage());
    });

    it('should hide error alert without dispatching clearSuccessMessage', () => {
      component.showErrorAlert = true;
      const dispatchCallsBefore = mockStore.dispatch.calls.count();
      component.closeAlert('error');
      expect(component.showErrorAlert).toBeFalse();
      const newDispatches = mockStore.dispatch.calls.allArgs().slice(dispatchCallsBefore);
      expect(newDispatches.some(args => JSON.stringify(args).includes('clearSuccessMessage'))).toBeFalse();
    });
  });
});
