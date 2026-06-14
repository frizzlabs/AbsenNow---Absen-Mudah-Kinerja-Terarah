import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateStep1Page } from './create-step1.page';

describe('CreateStep1Page', () => {
  let component: CreateStep1Page;
  let fixture: ComponentFixture<CreateStep1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStep1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
