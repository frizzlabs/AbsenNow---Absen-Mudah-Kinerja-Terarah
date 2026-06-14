import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CameraFrameComponent } from './camera-frame.component';

describe('CameraFrameComponent', () => {
  let component: CameraFrameComponent;
  let fixture: ComponentFixture<CameraFrameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CameraFrameComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
