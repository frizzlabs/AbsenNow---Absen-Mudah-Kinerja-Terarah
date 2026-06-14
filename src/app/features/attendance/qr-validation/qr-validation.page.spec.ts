import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrValidationPage } from './qr-validation.page';

describe('QrValidationPage', () => {
  let component: QrValidationPage;
  let fixture: ComponentFixture<QrValidationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QrValidationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
