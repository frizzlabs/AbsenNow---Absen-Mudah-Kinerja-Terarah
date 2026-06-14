import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReasonPage } from './reason.page';

describe('ReasonPage', () => {
  let component: ReasonPage;
  let fixture: ComponentFixture<ReasonPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReasonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
