import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FeedbackCardComponent } from './feedback-card.component';

describe('FeedbackCardComponent', () => {
  let component: FeedbackCardComponent;
  let fixture: ComponentFixture<FeedbackCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FeedbackCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
