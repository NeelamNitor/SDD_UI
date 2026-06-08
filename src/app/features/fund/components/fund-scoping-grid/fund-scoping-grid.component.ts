import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges,
  DestroyRef, inject
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Fund, FundLookups, FundSaveRequest } from '../../fund-state/fund.model';
import { FundService } from '../../../../shared/services/fund/fund.service';
import {
  containsLetterValidator, uniqueFundNameValidator, minArrayLengthValidator,
  maxDateTodayValidator, afterBeginDateValidator, auditSignOffDateValidator
} from '../../fund-state/fund.validators';
import { DropdownOption } from '../../../../shared/components/multi-select-dropdown/multi-select-dropdown.component';

interface EditingCell { rowIndex: number; field: string; }

@Component({
  selector: 'app-fund-scoping-grid',
  templateUrl: './fund-scoping-grid.component.html',
  styleUrls: ['./fund-scoping-grid.component.scss'],
  standalone: false
})
export class FundScopingGridComponent implements OnChanges {
  @Input() funds: Fund[] = [];
  @Input() lookups: FundLookups = { typeOfFunds: [], typeOfInvestments: [], fundAdministrators: [], brokerCustodians: [], reportingCurrencies: [] };
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() newlyAddedFundIds: number[] = [];

  @Output() rowCountChange = new EventEmitter<number>();
  @Output() selectedIdsChange = new EventEmitter<number[]>();
  @Output() dirtyChange = new EventEmitter<boolean>();
  @Output() clearMessages = new EventEmitter<void>();

  fundArray: FormArray;
  editingCell: EditingCell | null = null;
  newRowIndices = new Set<number>();
  selectedSet = new Set<string>();

  inlineBanner: { type: 'success' | 'danger'; message: string } | null = null;
  showValidationBanner = false;

  private prevCellValue: any = null;
  private destroyRef = inject(DestroyRef);

  constructor(private fb: FormBuilder, private fundService: FundService) {
    this.fundArray = this.fb.array([]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['funds'] && !changes['funds'].firstChange) {
      this.rebuildArray(this.funds);
    } else if (changes['funds'] && changes['funds'].firstChange && this.funds.length > 0) {
      this.rebuildArray(this.funds);
    }
  }

  // ── FormArray helpers ─────────────────────────────────────────────────────

  private rebuildArray(funds: Fund[]): void {
    const groups = funds.map(f => this.buildRowGroup(f));
    this.fundArray = this.fb.array(groups);
    this.newRowIndices.clear();
    this.selectedSet.clear();
    this.emitRowCount();
  }

  buildRowGroup(fund?: Partial<Fund>): FormGroup {
    const idx = this.fundArray ? this.fundArray.length : 0;
    const group = this.fb.group(
      {
        fundId: [fund?.fundId ?? null],
        engagementId: [fund?.engagementId ?? 0],
        fundName: [
          fund?.fundName ?? '',
          [Validators.required, Validators.minLength(3), Validators.maxLength(200), containsLetterValidator]
        ],
        typeOfFundId: [fund?.typeOfFundId ?? null, Validators.required],
        typesOfInvestmentIds: [fund?.typesOfInvestmentIds ?? [], minArrayLengthValidator(1)],
        fundAdministratorId: [fund?.fundAdministratorId ?? null, Validators.required],
        brokerCustodianIds: [fund?.brokerCustodianIds ?? [], minArrayLengthValidator(1)],
        reportingCurrencyId: [fund?.reportingCurrencyId ?? null, Validators.required],
        periodBeginDate: [fund?.periodBeginDate ?? '', [Validators.required, maxDateTodayValidator]],
        periodEndDate: [fund?.periodEndDate ?? '', Validators.required],
        expectedAuditSignOffDate: [fund?.expectedAuditSignOffDate ?? '', Validators.required],
        materiality: [fund?.materiality ?? null],
        performanceMateriality: [fund?.performanceMateriality ?? null],
        auditMisstatementPostingThreshold: [fund?.auditMisstatementPostingThreshold ?? null],
        status: [{ value: fund?.status ?? '', disabled: true }]
      },
      { validators: [afterBeginDateValidator, auditSignOffDateValidator] }
    );

    // Apply name uniqueness validator after group creation
    group.get('fundName')?.addValidators(uniqueFundNameValidator(this.fundArray, idx));

    // Lock fields for post-Data-Import funds
    if (fund?.status && this.isPostDataImport(fund.status)) {
      group.get('periodBeginDate')?.disable();
      group.get('periodEndDate')?.disable();
      group.get('typeOfFundId')?.disable();
    }

    return group;
  }

  addRow(values?: Partial<Fund>): void {
    const group = this.buildRowGroup(values);
    this.fundArray.insert(0, group);
    // Shift existing new-row indices up
    const shifted = new Set<number>();
    this.newRowIndices.forEach(i => shifted.add(i + 1));
    this.newRowIndices = shifted;
    this.newRowIndices.add(0);
    this.emitRowCount();
    this.dirtyChange.emit(true);
  }

  duplicateSelected(): void {
    const selKey = [...this.selectedSet][0];
    const idx = this.getIndexFromKey(selKey);
    if (idx === null) return;
    const raw = this.asFormGroup(this.fundArray.at(idx)).getRawValue();
    const { fundId, status, ...rest } = raw;
    this.addRow(rest);
  }

  removeUnsavedSelected(): void {
    const indicesToRemove: number[] = [];
    this.selectedSet.forEach(key => {
      if (key.startsWith('new-')) {
        const idx = parseInt(key.replace('new-', ''), 10);
        indicesToRemove.push(idx);
      }
    });
    // Remove from highest index down to avoid index shift
    indicesToRemove.sort((a, b) => b - a).forEach(i => {
      this.fundArray.removeAt(i);
      this.newRowIndices.delete(i);
      this.selectedSet.delete(`new-${i}`);
    });
    this.emitRowCount();
  }

  clearNewRows(): void {
    this.newRowIndices.clear();
  }

  // ── Validation ────────────────────────────────────────────────────────────

  isValid(): boolean {
    this.fundArray.controls.forEach(c => c.markAllAsTouched());
    this.fundArray.updateValueAndValidity();
    this.showValidationBanner = this.fundArray.invalid;
    return this.fundArray.valid;
  }

  getNewRowValues(): FundSaveRequest[] {
    const results: FundSaveRequest[] = [];
    this.newRowIndices.forEach(i => {
      const group = this.asFormGroup(this.fundArray.at(i));
      const v = group.getRawValue();
      results.push({
        engagementId: v.engagementId,
        fundName: v.fundName,
        typeOfFundId: v.typeOfFundId,
        typesOfInvestmentIds: v.typesOfInvestmentIds,
        fundAdministratorId: v.fundAdministratorId,
        brokerCustodianIds: v.brokerCustodianIds,
        reportingCurrencyId: v.reportingCurrencyId,
        periodBeginDate: v.periodBeginDate,
        periodEndDate: v.periodEndDate,
        expectedAuditSignOffDate: v.expectedAuditSignOffDate,
        materiality: v.materiality,
        performanceMateriality: v.performanceMateriality,
        auditMisstatementPostingThreshold: v.auditMisstatementPostingThreshold
      });
    });
    return results;
  }

  // ── Cell editing ──────────────────────────────────────────────────────────

  isEditing(rowIndex: number, field: string): boolean {
    return this.editingCell?.rowIndex === rowIndex && this.editingCell?.field === field;
  }

  isNewRow(rowIndex: number): boolean {
    return this.newRowIndices.has(rowIndex);
  }

  isCellLocked(rowIndex: number, field: string): boolean {
    const ctrl = this.asFormGroup(this.fundArray.at(rowIndex)).get(field);
    return ctrl?.disabled === true;
  }

  onCellDblClick(rowIndex: number, field: string): void {
    if (this.isNewRow(rowIndex) || this.isCellLocked(rowIndex, field)) return;
    this.prevCellValue = this.asFormGroup(this.fundArray.at(rowIndex)).get(field)?.value;
    this.editingCell = { rowIndex, field };
  }

  onCellBlur(rowIndex: number, field: string): void {
    if (!this.isEditing(rowIndex, field)) return;
    this.editingCell = null;
    this.saveExistingRow(rowIndex);
  }

  onCellEnter(rowIndex: number, field: string): void {
    if (!this.isEditing(rowIndex, field)) return;
    this.editingCell = null;
    this.saveExistingRow(rowIndex);
  }

  onCellEscape(rowIndex: number, field: string): void {
    if (!this.isEditing(rowIndex, field)) return;
    this.asFormGroup(this.fundArray.at(rowIndex)).get(field)?.setValue(this.prevCellValue);
    this.editingCell = null;
  }

  private saveExistingRow(rowIndex: number): void {
    if (this.isNewRow(rowIndex)) return;
    const group = this.asFormGroup(this.fundArray.at(rowIndex));
    const fundId = group.get('fundId')?.value;
    if (!fundId) return;

    group.updateValueAndValidity();
    if (group.invalid) {
      group.markAllAsTouched();
      this.inlineBanner = { type: 'danger', message: 'Mandatory fields. Please enter valid details and proceed.' };
      return;
    }

    const v = group.getRawValue();
    const payload: FundSaveRequest = {
      fundId: v.fundId,
      engagementId: v.engagementId,
      fundName: v.fundName,
      typeOfFundId: v.typeOfFundId,
      typesOfInvestmentIds: v.typesOfInvestmentIds,
      fundAdministratorId: v.fundAdministratorId,
      brokerCustodianIds: v.brokerCustodianIds,
      reportingCurrencyId: v.reportingCurrencyId,
      periodBeginDate: v.periodBeginDate,
      periodEndDate: v.periodEndDate,
      expectedAuditSignOffDate: v.expectedAuditSignOffDate,
      materiality: v.materiality,
      performanceMateriality: v.performanceMateriality,
      auditMisstatementPostingThreshold: v.auditMisstatementPostingThreshold
    };

    this.fundService.updateFund(fundId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.inlineBanner = { type: 'success', message: `Fund has been updated successfully: ${v.fundName}` };
          setTimeout(() => this.inlineBanner = null, 4000);
        },
        error: () => {
          this.inlineBanner = { type: 'danger', message: 'We could not save your changes. Please try again.' };
        }
      });
  }

  // ── Checkbox ──────────────────────────────────────────────────────────────

  getRowKey(rowIndex: number): string {
    const fundId = this.asFormGroup(this.fundArray.at(rowIndex)).get('fundId')?.value;
    return fundId ? `id-${fundId}` : `new-${rowIndex}`;
  }

  private getIndexFromKey(key: string): number | null {
    for (let i = 0; i < this.fundArray.length; i++) {
      if (this.getRowKey(i) === key) return i;
    }
    return null;
  }

  isChecked(rowIndex: number): boolean {
    return this.selectedSet.has(this.getRowKey(rowIndex));
  }

  onCheckChange(rowIndex: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const key = this.getRowKey(rowIndex);
    if (checked) {
      this.selectedSet.add(key);
    } else {
      this.selectedSet.delete(key);
    }
    this.emitSelectedIds();
  }

  isAllChecked(): boolean {
    return this.fundArray.length > 0 && this.fundArray.controls.every((_, i) => this.isChecked(i));
  }

  selectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    for (let i = 0; i < this.fundArray.length; i++) {
      const key = this.getRowKey(i);
      if (checked) this.selectedSet.add(key); else this.selectedSet.delete(key);
    }
    this.emitSelectedIds();
  }

  private emitSelectedIds(): void {
    const ids: number[] = [];
    this.selectedSet.forEach(key => {
      if (key.startsWith('id-')) ids.push(parseInt(key.replace('id-', ''), 10));
      else ids.push(-1); // new rows flagged as -1 to indicate unsaved
    });
    this.selectedIdsChange.emit(ids);
  }

  // ── Display helpers ───────────────────────────────────────────────────────

  asFormGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  getLookupName(list: DropdownOption[], id: number | null): string {
    if (!id) return '—';
    return list.find(l => l.id === id)?.name ?? '—';
  }

  getMultiLookupNames(list: DropdownOption[], ids: number[]): string {
    if (!ids?.length) return '—';
    const names = ids.map(id => list.find(l => l.id === id)?.name).filter(Boolean) as string[];
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
  }

  formatDate(val: string): string {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  isRowHighlighted(rowIndex: number): boolean {
    const fundId = this.asFormGroup(this.fundArray.at(rowIndex)).get('fundId')?.value;
    return fundId && this.newlyAddedFundIds.includes(fundId);
  }

  private isPostDataImport(status: string): boolean {
    const locked = ['data import', 'in progress', 'completed', 'review', 'signed off'];
    return locked.includes((status ?? '').toLowerCase());
  }

  private emitRowCount(): void {
    this.rowCountChange.emit(this.fundArray.length);
  }

  dismissInlineBanner(): void {
    this.inlineBanner = null;
  }

  onUserAction(): void {
    this.clearMessages.emit();
  }
}
