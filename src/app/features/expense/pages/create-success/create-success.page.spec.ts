import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateSuccessPage } from './create-success.page';

describe('CreateSuccessPage', () => {
  let component: CreateSuccessPage;
  let fixture: ComponentFixture<CreateSuccessPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSuccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
