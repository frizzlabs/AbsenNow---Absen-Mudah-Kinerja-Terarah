import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefaultVariantPage } from './default-variant.page';

describe('DefaultVariantPage', () => {
  let component: DefaultVariantPage;
  let fixture: ComponentFixture<DefaultVariantPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultVariantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
