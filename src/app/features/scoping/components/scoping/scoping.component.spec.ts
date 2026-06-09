import { ScopingComponent } from './scoping.component';

describe('ScopingComponent', () => {
  let component: ScopingComponent;

  beforeEach(() => {
    component = new ScopingComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default activeTab as "details"', () => {
    expect(component.activeTab).toBe('details');
  });

  describe('setActiveTab', () => {
    it('should set activeTab to "add"', () => {
      component.setActiveTab('add');
      expect(component.activeTab).toBe('add');
    });

    it('should set activeTab to "details"', () => {
      component.activeTab = 'add';
      component.setActiveTab('details');
      expect(component.activeTab).toBe('details');
    });

    it('should set activeTab to "fund"', () => {
      component.setActiveTab('fund');
      expect(component.activeTab).toBe('fund');
    });

    it('should update activeTab when called multiple times', () => {
      component.setActiveTab('add');
      component.setActiveTab('fund');
      expect(component.activeTab).toBe('fund');
    });
  });
});
