import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExpenseStatCardComponent } from './expense-stat-card.component';

describe('ExpenseStatCardComponent', () => {
  let component: ExpenseStatCardComponent;
  let fixture: ComponentFixture<ExpenseStatCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExpenseStatCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseStatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
