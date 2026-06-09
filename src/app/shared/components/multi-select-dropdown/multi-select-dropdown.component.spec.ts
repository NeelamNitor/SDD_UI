import { ElementRef } from '@angular/core';
import { MultiSelectDropdownComponent, DropdownOption } from './multi-select-dropdown.component';

describe('MultiSelectDropdownComponent', () => {
  let component: MultiSelectDropdownComponent;
  let el: HTMLElement;

  const mockOptions: DropdownOption[] = [
    { id: 1, name: 'Option A' },
    { id: 2, name: 'Option B' },
    { id: 3, name: 'Option C' }
  ];

  beforeEach(() => {
    el = document.createElement('div');
    component = new MultiSelectDropdownComponent(new ElementRef(el));
    component.options = mockOptions;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('displayText getter', () => {
    it('should show placeholder when nothing is selected', () => {
      component.placeholder = 'Choose...';
      component.selectedIds = [];
      expect(component.displayText).toBe('Choose...');
    });

    it('should show single option name', () => {
      component.selectedIds = [1];
      expect(component.displayText).toBe('Option A');
    });

    it('should show two option names joined by comma', () => {
      component.selectedIds = [1, 2];
      expect(component.displayText).toBe('Option A, Option B');
    });

    it('should show first two names with +N more for 3 selected', () => {
      component.selectedIds = [1, 2, 3];
      expect(component.displayText).toBe('Option A, Option B +1 more');
    });
  });

  describe('toggleDropdown', () => {
    it('should open dropdown when closed', () => {
      component.isOpen = false;
      component.toggleDropdown();
      expect(component.isOpen).toBeTrue();
    });

    it('should close dropdown when open', () => {
      component.isOpen = true;
      component.toggleDropdown();
      expect(component.isOpen).toBeFalse();
    });

    it('should call onTouched when closing', () => {
      const touchedFn = jasmine.createSpy('onTouched');
      component.registerOnTouched(touchedFn);
      component.isOpen = true;
      component.toggleDropdown();
      expect(touchedFn).toHaveBeenCalled();
    });

    it('should not call onTouched when opening', () => {
      const touchedFn = jasmine.createSpy('onTouched');
      component.registerOnTouched(touchedFn);
      component.isOpen = false;
      component.toggleDropdown();
      expect(touchedFn).not.toHaveBeenCalled();
    });

    it('should do nothing when disabled', () => {
      component.isDisabled = true;
      component.isOpen = false;
      component.toggleDropdown();
      expect(component.isOpen).toBeFalse();
    });
  });

  describe('isSelected', () => {
    it('should return true for a selected id', () => {
      component.selectedIds = [1, 2];
      expect(component.isSelected(1)).toBeTrue();
    });

    it('should return false for an unselected id', () => {
      component.selectedIds = [2];
      expect(component.isSelected(1)).toBeFalse();
    });

    it('should return false when selectedIds is empty', () => {
      component.selectedIds = [];
      expect(component.isSelected(1)).toBeFalse();
    });
  });

  describe('toggleOption', () => {
    it('should add option when not already selected', () => {
      component.selectedIds = [];
      component.toggleOption(1);
      expect(component.selectedIds).toContain(1);
    });

    it('should remove option when already selected', () => {
      component.selectedIds = [1, 2];
      component.toggleOption(1);
      expect(component.selectedIds).not.toContain(1);
      expect(component.selectedIds).toContain(2);
    });

    it('should call onChange with updated selectedIds after add', () => {
      const changeFn = jasmine.createSpy('onChange');
      component.registerOnChange(changeFn);
      component.selectedIds = [];
      component.toggleOption(2);
      expect(changeFn).toHaveBeenCalledWith([2]);
    });

    it('should call onChange with updated selectedIds after remove', () => {
      const changeFn = jasmine.createSpy('onChange');
      component.registerOnChange(changeFn);
      component.selectedIds = [1, 2];
      component.toggleOption(1);
      expect(changeFn).toHaveBeenCalledWith([2]);
    });
  });

  describe('ControlValueAccessor', () => {
    it('writeValue should set selectedIds from valid array', () => {
      component.writeValue([1, 3]);
      expect(component.selectedIds).toEqual([1, 3]);
    });

    it('writeValue should set empty array for null', () => {
      component.writeValue(null as any);
      expect(component.selectedIds).toEqual([]);
    });

    it('writeValue should set empty array for non-array value', () => {
      component.writeValue('invalid' as any);
      expect(component.selectedIds).toEqual([]);
    });

    it('setDisabledState true should set isDisabled', () => {
      component.setDisabledState(true);
      expect(component.isDisabled).toBeTrue();
    });

    it('setDisabledState false should clear isDisabled', () => {
      component.isDisabled = true;
      component.setDisabledState(false);
      expect(component.isDisabled).toBeFalse();
    });

    it('registerOnChange should store and invoke function on change', () => {
      const fn = jasmine.createSpy('onChange');
      component.registerOnChange(fn);
      component.toggleOption(1);
      expect(fn).toHaveBeenCalled();
    });

    it('registerOnTouched should store and invoke function on blur', () => {
      const fn = jasmine.createSpy('onTouched');
      component.registerOnTouched(fn);
      component.isOpen = true;
      component.toggleDropdown();
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('onDocumentClick', () => {
    it('should close dropdown when clicking outside the component', () => {
      component.isOpen = true;
      const externalEl = document.createElement('div');
      document.body.appendChild(externalEl);
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: externalEl, configurable: true });
      component.onDocumentClick(event);
      expect(component.isOpen).toBeFalse();
      document.body.removeChild(externalEl);
    });

    it('should keep dropdown open when clicking inside the component', () => {
      component.isOpen = true;
      const innerChild = document.createElement('span');
      el.appendChild(innerChild);
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: innerChild, configurable: true });
      component.onDocumentClick(event);
      expect(component.isOpen).toBeTrue();
      el.removeChild(innerChild);
    });
  });
});
