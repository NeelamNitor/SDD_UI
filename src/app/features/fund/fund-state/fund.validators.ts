import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function containsLetterValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  return /[a-zA-Z]/.test(value) ? null : { containsLetter: true };
}

export function uniqueFundNameValidator(fundArray: FormArray, currentIndex: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim().toLowerCase();
    if (!value) return null;
    const duplicate = fundArray.controls.some((group, i) => {
      if (i === currentIndex) return false;
      const other = ((group as FormGroup).get('fundName')?.value ?? '').toString().trim().toLowerCase();
      return other === value;
    });
    return duplicate ? { uniqueFundName: true } : null;
  };
}

export function minArrayLengthValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!Array.isArray(value) || value.length < min) {
      return { minArrayLength: { required: min, actual: Array.isArray(value) ? value.length : 0 } };
    }
    return null;
  };
}

export function maxDateTodayValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const selected = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selected > today ? { maxDateToday: true } : null;
}

export function afterBeginDateValidator(group: AbstractControl): ValidationErrors | null {
  const fg = group as FormGroup;
  const begin = fg.get('periodBeginDate')?.value;
  const end = fg.get('periodEndDate')?.value;
  if (!begin || !end) return null;
  const beginDate = new Date(begin);
  const endDate = new Date(end);
  if (endDate <= beginDate) {
    fg.get('periodEndDate')?.setErrors({ ...(fg.get('periodEndDate')?.errors ?? {}), afterBeginDate: true });
    return { afterBeginDate: true };
  }
  const existing = fg.get('periodEndDate')?.errors;
  if (existing?.['afterBeginDate']) {
    const { afterBeginDate: _, ...rest } = existing;
    fg.get('periodEndDate')?.setErrors(Object.keys(rest).length ? rest : null);
  }
  return null;
}

export function auditSignOffDateValidator(group: AbstractControl): ValidationErrors | null {
  const fg = group as FormGroup;
  const begin = fg.get('periodBeginDate')?.value;
  const end = fg.get('periodEndDate')?.value;
  const audit = fg.get('expectedAuditSignOffDate')?.value;
  if (!audit) return null;
  const auditDate = new Date(audit);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const beginDate = begin ? new Date(begin) : null;
  const endDate = end ? new Date(end) : null;
  const invalid =
    auditDate < today ||
    (beginDate && auditDate < beginDate) ||
    (endDate && auditDate < endDate);
  if (invalid) {
    fg.get('expectedAuditSignOffDate')?.setErrors({ ...(fg.get('expectedAuditSignOffDate')?.errors ?? {}), auditSignOff: true });
    return { auditSignOff: true };
  }
  const existing = fg.get('expectedAuditSignOffDate')?.errors;
  if (existing?.['auditSignOff']) {
    const { auditSignOff: _, ...rest } = existing;
    fg.get('expectedAuditSignOffDate')?.setErrors(Object.keys(rest).length ? rest : null);
  }
  return null;
}
