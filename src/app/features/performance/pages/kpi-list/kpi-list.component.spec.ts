import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KpiListComponent } from './kpi-list.component';

describe('KpiListComponent', () => {
  let component: KpiListComponent;
  let fixture: ComponentFixture<KpiListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [KpiListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
