import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateStep2Page } from './create-step2.page';

describe('CreateStep2Page', () => {
  let component: CreateStep2Page;
  let fixture: ComponentFixture<CreateStep2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStep2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
