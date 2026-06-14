import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PinDotsComponent } from './pin-dots.component';

describe('PinDotsComponent', () => {
  let component: PinDotsComponent;
  let fixture: ComponentFixture<PinDotsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PinDotsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PinDotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
