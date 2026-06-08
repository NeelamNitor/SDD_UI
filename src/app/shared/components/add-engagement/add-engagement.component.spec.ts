import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEngagementComponent } from './add-engagement.component';

describe('AddEngagementComponent', () => {
  let component: AddEngagementComponent;
  let fixture: ComponentFixture<AddEngagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEngagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEngagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
