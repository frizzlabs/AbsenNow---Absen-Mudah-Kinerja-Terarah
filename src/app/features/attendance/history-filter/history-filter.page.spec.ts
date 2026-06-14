import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryFilterPage } from './history-filter.page';

describe('HistoryFilterPage', () => {
  let component: HistoryFilterPage;
  let fixture: ComponentFixture<HistoryFilterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryFilterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
