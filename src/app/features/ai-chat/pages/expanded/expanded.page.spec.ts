import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpandedPage } from './expanded.page';

describe('ExpandedPage', () => {
  let component: ExpandedPage;
  let fixture: ComponentFixture<ExpandedPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
