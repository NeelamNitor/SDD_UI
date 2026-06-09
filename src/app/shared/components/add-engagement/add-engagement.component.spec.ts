import { Injector, runInInjectionContext, DestroyRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { AddEngagementComponent } from './add-engagement.component';
import { AddEngagementService } from './services/add-engagement.service';
import * as EngActions from '../engagement-details/engagement-state/actions/eng-actions';
import { EngdetailsModel } from '../engagement-details/engagement-state/models/engDetails';

describe('AddEngagementComponent', () => {
  let component: AddEngagementComponent;
  let mockStore: jasmine.SpyObj<Store<any>>;
  let addEngagementService: jasmine.SpyObj<AddEngagementService>;
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

  function createComponent(): AddEngagementComponent {
    stateSubject = new BehaviorSubject<any>(baseState);
    mockStore.select.and.callFake((selector: any) =>
      stateSubject.pipe(map((state: any) => selector(state)))
    );

    const injector = Injector.create({
      providers: [
        { provide: DestroyRef, useValue: mockDestroyRef },
        { provide: Store, useValue: mockStore },
        { provide: AddEngagementService, useValue: addEngagementService }
      ]
    });

    let comp!: AddEngagementComponent;
    runInInjectionContext(injector, () => {
      comp = new AddEngagementComponent(
        new FormBuilder(),
        addEngagementService,
        mockStore as any
      );
    });
    comp.ngOnInit();
    return comp;
  }

  beforeEach(() => {
    addEngagementService = jasmine.createSpyObj('AddEngagementService', [
      'submitEngagement', 'updateEngagement', 'getEngagementTypes', 'getRegions', 'getBusinessUnits', 'getAdGroups'
    ]);
    mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    component = createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization', () => {
    it('should initialize form with empty fields', () => {
      expect(component.engagementForm.get('engagementName')?.value).toBe('');
      expect(component.engagementForm.get('engagementCode')?.value).toBe('');
      expect(component.engagementForm.get('periodEndDate')?.value).toBe('');
    });

    it('should be invalid when engagementName is empty', () => {
      component.engagementForm.patchValue({ engagementName: '', periodEndDate: '2024-12-31' });
      expect(component.engagementForm.get('engagementName')?.invalid).toBeTrue();
    });

    it('should be invalid when engagementName is less than 3 characters', () => {
      component.engagementForm.patchValue({ engagementName: 'ab', periodEndDate: '2024-12-31' });
      expect(component.engagementForm.get('engagementName')?.hasError('minlength')).toBeTrue();
    });

    it('should be invalid when periodEndDate is empty', () => {
      component.engagementForm.patchValue({ engagementName: 'Valid Name', periodEndDate: '' });
      expect(component.engagementForm.invalid).toBeTrue();
    });

    it('should be valid with required fields filled', () => {
      component.engagementForm.patchValue({ engagementName: 'Valid Name', periodEndDate: '2024-12-31' });
      expect(component.engagementForm.valid).toBeTrue();
    });
  });

  describe('loadFormWithData', () => {
    it('should patch form with all engagement data', () => {
      component.loadFormWithData({
        engagementName: 'Test Eng', engagementCode: 'CODE1',
        engagementManager: 'Manager A', engagementPartner: 'Partner B', periodEndDate: '2024-12-31'
      });
      expect(component.engagementForm.get('engagementName')?.value).toBe('Test Eng');
      expect(component.engagementForm.get('engagementCode')?.value).toBe('CODE1');
      expect(component.engagementForm.get('periodEndDate')?.value).toBe('2024-12-31');
    });

    it('should default missing fields to empty string', () => {
      component.loadFormWithData({ engagementName: 'Name', periodEndDate: '2024-01-01' });
      expect(component.engagementForm.get('engagementCode')?.value).toBe('');
      expect(component.engagementForm.get('engagementManager')?.value).toBe('');
    });
  });

  describe('onSubmit - invalid form', () => {
    it('should show error alert and stop when form is invalid', () => {
      component.engagementForm.patchValue({ engagementName: '', periodEndDate: '' });
      component.onSubmit();
      expect(component.showErrorAlert).toBeTrue();
      expect(component.errorMessage).toBe('Please fill in all required fields correctly.');
      expect(addEngagementService.submitEngagement).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit - create mode', () => {
    beforeEach(() => {
      component.engagementForm.patchValue({ engagementName: 'Valid Name', periodEndDate: '2024-12-31' });
    });

    it('should call submitEngagement when not in edit mode', () => {
      addEngagementService.submitEngagement.and.returnValue(of({ success: true, message: 'Created', engagementId: 1 }));
      component.onSubmit();
      expect(addEngagementService.submitEngagement).toHaveBeenCalled();
    });

    it('should show success alert on successful create', () => {
      addEngagementService.submitEngagement.and.returnValue(of({ success: true, message: 'Created!', engagementId: 1 }));
      component.onSubmit();
      expect(component.showSuccessAlert).toBeTrue();
      expect(component.successMessage).toBe('Created!');
    });

    it('should use default success message when response message is empty', () => {
      addEngagementService.submitEngagement.and.returnValue(of({ success: true, message: '', engagementId: 1 }));
      component.onSubmit();
      expect(component.successMessage).toBe('Engagement added successfully!');
    });

    it('should dispatch updateEngDetails and clearEditEngagement on success', () => {
      addEngagementService.submitEngagement.and.returnValue(of({ success: true, message: 'OK', engagementId: 10 }));
      component.onSubmit();
      expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({ type: EngActions.ENGDETAILS_UPDATE }));
      expect(mockStore.dispatch).toHaveBeenCalledWith(EngActions.clearEditEngagement());
    });

    it('should show error alert when response success is false', () => {
      addEngagementService.submitEngagement.and.returnValue(of({ success: false, message: 'Duplicate entry', engagementId: undefined }));
      component.onSubmit();
      expect(component.showErrorAlert).toBeTrue();
      expect(component.errorMessage).toBe('Duplicate entry');
    });

    it('should use default failure message when response message is empty', () => {
      addEngagementService.submitEngagement.and.returnValue(of({ success: false, message: '', engagementId: undefined }));
      component.onSubmit();
      expect(component.errorMessage).toBe('Failed to add engagement.');
    });

    it('should show error alert on HTTP error', () => {
      addEngagementService.submitEngagement.and.returnValue(throwError(() => ({ error: { message: 'Server error' } })));
      component.onSubmit();
      expect(component.showErrorAlert).toBeTrue();
      expect(component.errorMessage).toBe('Server error');
    });

    it('should set isLoading false after success response', () => {
      addEngagementService.submitEngagement.and.returnValue(of({ success: true, message: 'OK', engagementId: 1 }));
      component.onSubmit();
      expect(component.isLoading).toBeFalse();
    });

    it('should set isLoading false after error', () => {
      addEngagementService.submitEngagement.and.returnValue(throwError(() => new Error('fail')));
      component.onSubmit();
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('onSubmit - edit mode', () => {
    beforeEach(() => {
      component.isEditMode = true;
      component.editingEngagementId = 5;
      component.engagementForm.patchValue({ engagementName: 'Updated Name', periodEndDate: '2024-12-31' });
    });

    it('should call updateEngagement with the correct id', () => {
      addEngagementService.updateEngagement.and.returnValue(of({ success: true, message: 'Updated', engagementId: 5 }));
      component.onSubmit();
      expect(addEngagementService.updateEngagement).toHaveBeenCalledWith(5, jasmine.any(Object));
    });

    it('should use default edit success message when message is empty', () => {
      addEngagementService.updateEngagement.and.returnValue(of({ success: true, message: '', engagementId: 5 }));
      component.onSubmit();
      expect(component.successMessage).toBe('Engagement updated successfully!');
    });

    it('should use default edit failure message when message is empty', () => {
      addEngagementService.updateEngagement.and.returnValue(of({ success: false, message: '', engagementId: undefined }));
      component.onSubmit();
      expect(component.errorMessage).toBe('Failed to update engagement.');
    });
  });

  describe('resetForm', () => {
    it('should reset all form controls', () => {
      component.engagementForm.patchValue({ engagementName: 'Test', periodEndDate: '2024-01-01' });
      component.resetForm();
      expect(component.engagementForm.get('engagementName')?.value).toBeNull();
    });

    it('should hide both alerts', () => {
      component.showSuccessAlert = true;
      component.showErrorAlert = true;
      component.resetForm();
      expect(component.showSuccessAlert).toBeFalse();
      expect(component.showErrorAlert).toBeFalse();
    });

    it('should clear edit mode flags', () => {
      component.isEditMode = true;
      component.editingEngagementId = 5;
      component.resetForm();
      expect(component.isEditMode).toBeFalse();
      expect(component.editingEngagementId).toBeNull();
    });

    it('should dispatch clearEditEngagement', () => {
      component.resetForm();
      expect(mockStore.dispatch).toHaveBeenCalledWith(EngActions.clearEditEngagement());
    });
  });

  describe('closeAlert', () => {
    it('should hide success alert', () => {
      component.showSuccessAlert = true;
      component.closeAlert('success');
      expect(component.showSuccessAlert).toBeFalse();
    });

    it('should hide error alert', () => {
      component.showErrorAlert = true;
      component.closeAlert('error');
      expect(component.showErrorAlert).toBeFalse();
    });
  });

  describe('ngOnInit - store subscription', () => {
    it('should enter edit mode when editingEngagement is set', () => {
      const editingEngagement: EngdetailsModel = { engagementId: 1, engagementName: 'Edit Eng', periodEndDate: '2024-12-31' };
      stateSubject.next({ engDetails: { ...baseState.engDetails, editingEngagement } });
      expect(component.isEditMode).toBeTrue();
      expect(component.editingEngagementId).toBe(1);
    });

    it('should exit edit mode when editingEngagement becomes null', () => {
      component.isEditMode = true;
      stateSubject.next({ engDetails: { ...baseState.engDetails, editingEngagement: null } });
      expect(component.isEditMode).toBeFalse();
    });
  });
});
