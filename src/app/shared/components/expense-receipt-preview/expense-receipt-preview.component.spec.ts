import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExpenseReceiptPreviewComponent } from './expense-receipt-preview.component';

describe('ExpenseReceiptPreviewComponent', () => {
  let component: ExpenseReceiptPreviewComponent;
  let fixture: ComponentFixture<ExpenseReceiptPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExpenseReceiptPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseReceiptPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
