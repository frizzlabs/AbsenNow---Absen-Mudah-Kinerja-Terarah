import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExpenseStepperComponent } from './expense-stepper.component';

describe('ExpenseStepperComponent', () => {
  let component: ExpenseStepperComponent;
  let fixture: ComponentFixture<ExpenseStepperComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExpenseStepperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
