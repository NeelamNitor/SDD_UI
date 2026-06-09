import { DatepickerWrapperComponent } from './datepicker-wrapper.component';

describe('DatepickerWrapperComponent', () => {
  let component: DatepickerWrapperComponent;

  beforeEach(() => {
    component = new DatepickerWrapperComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty value and enabled state', () => {
    expect(component.value).toBe('');
    expect(component.isDisabled).toBeFalse();
  });

  describe('writeValue', () => {
    it('should set value from a valid string', () => {
      component.writeValue('2024-12-31');
      expect(component.value).toBe('2024-12-31');
    });

    it('should set empty string when null is passed', () => {
      component.writeValue(null as any);
      expect(component.value).toBe('');
    });

    it('should set empty string when undefined is passed', () => {
      component.writeValue(undefined as any);
      expect(component.value).toBe('');
    });
  });

  describe('onInput', () => {
    it('should update value from input event', () => {
      const inputEl = document.createElement('input');
      inputEl.value = '2024-06-15';
      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: inputEl, configurable: true });
      component.onInput(event);
      expect(component.value).toBe('2024-06-15');
    });

    it('should call onChange with the new value', () => {
      const changeFn = jasmine.createSpy('onChange');
      component.registerOnChange(changeFn);
      const inputEl = document.createElement('input');
      inputEl.value = '2025-03-01';
      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: inputEl, configurable: true });
      component.onInput(event);
      expect(changeFn).toHaveBeenCalledWith('2025-03-01');
    });
  });

  describe('onBlur', () => {
    it('should call onTouched when blurred', () => {
      const touchedFn = jasmine.createSpy('onTouched');
      component.registerOnTouched(touchedFn);
      component.onBlur();
      expect(touchedFn).toHaveBeenCalled();
    });
  });

  describe('setDisabledState', () => {
    it('should set isDisabled to true', () => {
      component.setDisabledState(true);
      expect(component.isDisabled).toBeTrue();
    });

    it('should set isDisabled to false', () => {
      component.isDisabled = true;
      component.setDisabledState(false);
      expect(component.isDisabled).toBeFalse();
    });
  });

  describe('registerOnChange', () => {
    it('should store the onChange function', () => {
      const fn = jasmine.createSpy('fn');
      component.registerOnChange(fn);
      const event = new Event('input');
      const input = document.createElement('input');
      input.value = 'test';
      Object.defineProperty(event, 'target', { value: input, configurable: true });
      component.onInput(event);
      expect(fn).toHaveBeenCalledWith('test');
    });
  });

  describe('registerOnTouched', () => {
    it('should store the onTouched function', () => {
      const fn = jasmine.createSpy('fn');
      component.registerOnTouched(fn);
      component.onBlur();
      expect(fn).toHaveBeenCalled();
    });
  });
});
