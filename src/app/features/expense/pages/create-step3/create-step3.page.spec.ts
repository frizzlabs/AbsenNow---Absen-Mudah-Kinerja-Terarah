import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateStep3Page } from './create-step3.page';

describe('CreateStep3Page', () => {
  let component: CreateStep3Page;
  let fixture: ComponentFixture<CreateStep3Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStep3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
