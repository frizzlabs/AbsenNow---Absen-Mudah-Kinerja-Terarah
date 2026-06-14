import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FeedbackDetailComponent } from './feedback-detail.component';

describe('FeedbackDetailComponent', () => {
  let component: FeedbackDetailComponent;
  let fixture: ComponentFixture<FeedbackDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FeedbackDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
