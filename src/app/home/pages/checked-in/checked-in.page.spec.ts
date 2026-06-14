import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckedInPage } from './checked-in.page';

describe('CheckedInPage', () => {
  let component: CheckedInPage;
  let fixture: ComponentFixture<CheckedInPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckedInPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
