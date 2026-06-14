import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateSummaryPage } from './create-summary.page';

describe('CreateSummaryPage', () => {
  let component: CreateSummaryPage;
  let fixture: ComponentFixture<CreateSummaryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
