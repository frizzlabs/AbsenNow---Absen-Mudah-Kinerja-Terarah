import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationPreviewPage } from './notification-preview.page';

describe('NotificationPreviewPage', () => {
  let component: NotificationPreviewPage;
  let fixture: ComponentFixture<NotificationPreviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
