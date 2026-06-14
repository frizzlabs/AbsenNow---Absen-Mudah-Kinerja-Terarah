import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaceValidationPage } from './face-validation.page';

describe('FaceValidationPage', () => {
  let component: FaceValidationPage;
  let fixture: ComponentFixture<FaceValidationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceValidationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
