import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-swipe-button',
  templateUrl: './swipe-button.component.html',
  styleUrls: ['./swipe-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SwipeButtonComponent implements OnDestroy {
  @Input() text: string = 'Slide to Check In';
  @Input() icon: string = 'log-in-outline';
  @Input() variant: 'primary' | 'danger' = 'primary';
  @Output() swipeComplete = new EventEmitter<void>();

  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;
  @ViewChild('handle') handleRef!: ElementRef<HTMLElement>;
  @ViewChild('btnText') textRef!: ElementRef<HTMLElement>;

  isDragging = false;
  isCompleted = false;
  currentX = 0;

  private startX = 0;
  private maxX = 0;
  private pendingX = 0;
  private rafId: number | null = null;

  // Stable references so we can remove the listeners we add on start
  private readonly moveListener = (e: MouseEvent | TouchEvent) => this.onMove(e);
  private readonly endListener = () => this.onEnd();

  constructor(private zone: NgZone) {}

  get textOpacity(): number {
    if (this.maxX === 0) return 1;
    const progress = this.currentX / this.maxX;
    // Fade from 1 down to 0.2 (20%) near completion
    return 1 - (progress * 0.8);
  }

  onStart(event: MouseEvent | TouchEvent) {
    if (this.isCompleted) return;
    this.isDragging = true;
    this.startX = this.getClientX(event);

    // Calculate boundaries
    const containerEl = this.containerRef.nativeElement;
    const handleEl = this.handleRef.nativeElement;
    const computedStyle = getComputedStyle(containerEl);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    this.maxX = containerEl.offsetWidth - handleEl.offsetWidth - paddingLeft - paddingRight;

    // Drive the drag OUTSIDE Angular so per-frame moves don't trigger
    // change detection on the whole page (the cause of the jank on device).
    this.zone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.moveListener);
      document.addEventListener('touchmove', this.moveListener, { passive: false });
      document.addEventListener('mouseup', this.endListener);
      document.addEventListener('touchend', this.endListener);
    });
  }

  private onMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging || this.isCompleted) return;
    // Stop the page from scrolling/rubber-banding while dragging
    if (event.type === 'touchmove' && event.cancelable) event.preventDefault();

    const clientX = this.getClientX(event);
    const deltaX = clientX - this.startX;
    this.pendingX = Math.max(0, Math.min(deltaX, this.maxX));

    // Coalesce to one DOM write per frame, written directly (no change detection)
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        this.currentX = this.pendingX;
        this.handleRef.nativeElement.style.transform = `translateX(${this.currentX}px)`;
        this.textRef.nativeElement.style.opacity = String(this.textOpacity);
      });
    }
  }

  private onEnd() {
    if (!this.isDragging || this.isCompleted) return;

    this.detachListeners();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.currentX = this.pendingX;

    const threshold = this.maxX * 0.9;
    const completed = this.currentX >= threshold;

    // Re-enter Angular to finalize state and let the CSS snap transition run via bindings
    this.zone.run(() => {
      this.isDragging = false;
      if (completed) {
        this.currentX = this.maxX; // Snap to end
        this.isCompleted = true;
        this.swipeComplete.emit();
      } else {
        this.currentX = 0; // Snap back to start
      }
      // Hand styling back to the template bindings for the animated snap
      this.handleRef.nativeElement.style.transform = '';
      this.textRef.nativeElement.style.opacity = '';
    });
  }

  private detachListeners() {
    document.removeEventListener('mousemove', this.moveListener);
    document.removeEventListener('touchmove', this.moveListener);
    document.removeEventListener('mouseup', this.endListener);
    document.removeEventListener('touchend', this.endListener);
  }

  ngOnDestroy() {
    this.detachListeners();
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  private getClientX(event: MouseEvent | TouchEvent): number {
    if (window.TouchEvent && event instanceof TouchEvent) {
      return event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX;
    }
    return (event as MouseEvent).clientX;
  }
}
