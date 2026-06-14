import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShortcutExpandedPage } from './shortcut-expanded.page';

describe('ShortcutExpandedPage', () => {
  let component: ShortcutExpandedPage;
  let fixture: ComponentFixture<ShortcutExpandedPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortcutExpandedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
