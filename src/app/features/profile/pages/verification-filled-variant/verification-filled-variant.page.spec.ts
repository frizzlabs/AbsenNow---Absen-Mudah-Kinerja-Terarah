import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificationFilledVariantPage } from './verification-filled-variant.page';

describe('VerificationFilledVariantPage', () => {
  let component: VerificationFilledVariantPage;
  let fixture: ComponentFixture<VerificationFilledVariantPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificationFilledVariantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
