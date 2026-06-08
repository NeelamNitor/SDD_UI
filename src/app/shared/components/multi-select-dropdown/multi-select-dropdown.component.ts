import { Component, forwardRef, Input, HostListener, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-multi-select-dropdown',
  templateUrl: './multi-select-dropdown.component.html',
  styleUrls: ['./multi-select-dropdown.component.scss'],
  standalone: false,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiSelectDropdownComponent),
    multi: true
  }]
})
export class MultiSelectDropdownComponent implements ControlValueAccessor {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Select...';

  selectedIds: number[] = [];
  isOpen = false;
  isDisabled = false;

  private onChange: (value: number[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  get displayText(): string {
    if (this.selectedIds.length === 0) return this.placeholder;
    const names = this.options
      .filter(o => this.selectedIds.includes(o.id))
      .map(o => o.name);
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
  }

  toggleDropdown(): void {
    if (!this.isDisabled) {
      this.isOpen = !this.isOpen;
      if (!this.isOpen) this.onTouched();
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  toggleOption(id: number): void {
    if (this.isSelected(id)) {
      this.selectedIds = this.selectedIds.filter(s => s !== id);
    } else {
      this.selectedIds = [...this.selectedIds, id];
    }
    this.onChange(this.selectedIds);
  }

  writeValue(value: number[]): void {
    this.selectedIds = Array.isArray(value) ? value : [];
  }

  registerOnChange(fn: (value: number[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
