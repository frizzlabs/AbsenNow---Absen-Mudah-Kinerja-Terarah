import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmittedPage } from './submitted.page';

describe('SubmittedPage', () => {
  let component: SubmittedPage;
  let fixture: ComponentFixture<SubmittedPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmittedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
