import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-swipe-button',
  templateUrl: './swipe-button.component.html',
  styleUrls: ['./swipe-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SwipeButtonComponent {
  @Input() text: string = 'Slide to Check In';
  @Input() icon: string = 'log-in-outline';
  @Input() variant: 'primary' | 'danger' = 'primary';
  @Output() swipeComplete = new EventEmitter<void>();

  @ViewChild('container') containerRef!: ElementRef;
  @ViewChild('handle') handleRef!: ElementRef;

  isDragging = false;
  startX = 0;
  currentX = 0;
  maxX = 0;
  isCompleted = false;

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
    const containerWidth = this.containerRef.nativeElement.offsetWidth;
    const handleWidth = this.handleRef.nativeElement.offsetWidth;
    const computedStyle = getComputedStyle(this.containerRef.nativeElement);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    
    this.maxX = containerWidth - handleWidth - paddingLeft - paddingRight;
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging || this.isCompleted) return;
    
    const clientX = this.getClientX(event);
    const deltaX = clientX - this.startX;
    
    // Clamp between 0 and maxX
    this.currentX = Math.max(0, Math.min(deltaX, this.maxX));
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onEnd() {
    if (!this.isDragging || this.isCompleted) return;
    this.isDragging = false;

    // Check threshold (90%)
    const threshold = this.maxX * 0.9;
    
    if (this.currentX >= threshold) {
      this.currentX = this.maxX; // Snap to end
      this.isCompleted = true;
      this.swipeComplete.emit();
    } else {
      this.currentX = 0; // Snap back to start
    }
  }

  private getClientX(event: MouseEvent | TouchEvent): number {
    if (window.TouchEvent && event instanceof TouchEvent) {
      return event.touches[0]?.clientX || event.changedTouches[0]?.clientX;
    }
    return (event as MouseEvent).clientX;
  }
}
