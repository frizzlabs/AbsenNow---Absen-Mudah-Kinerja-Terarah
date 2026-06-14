import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExpenseTimelineComponent } from './expense-timeline.component';

describe('ExpenseTimelineComponent', () => {
  let component: ExpenseTimelineComponent;
  let fixture: ComponentFixture<ExpenseTimelineComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExpenseTimelineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
