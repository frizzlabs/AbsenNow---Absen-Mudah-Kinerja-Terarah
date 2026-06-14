import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckedOutPage } from './checked-out.page';

describe('CheckedOutPage', () => {
  let component: CheckedOutPage;
  let fixture: ComponentFixture<CheckedOutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckedOutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
