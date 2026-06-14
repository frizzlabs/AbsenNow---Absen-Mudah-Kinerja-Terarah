import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalendarWidgetComponent } from './calendar-widget.component';

describe('CalendarWidgetComponent', () => {
  let component: CalendarWidgetComponent;
  let fixture: ComponentFixture<CalendarWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CalendarWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
