import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { BottomNavComponent } from '../shared/components/bottom-nav/bottom-nav.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { CardComponent } from '../shared/components/card/card.component';
import { AttendanceStateService } from '../core/services/attendance-state.service';
import { CheckedInPage } from './pages/checked-in/checked-in.page';
import { CheckedOutPage } from './pages/checked-out/checked-out.page';
import { SwipeButtonComponent } from '../shared/components/swipe-button/swipe-button.component';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent, StatusBadgeComponent, CardComponent, RouterModule, CheckedInPage, CheckedOutPage, SwipeButtonComponent, TranslatePipe],
})
export class HomePage {
  currentLocationName = 'Pemda Kota Bogor';
  showShortcuts = false;

  constructor(
    public attendanceService: AttendanceStateService,
    private router: Router,
    private http: HttpClient
  ) {}

  ionViewWillEnter() {
    this.attendanceService.syncStatus();
    this.getCurrentLocation();
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.reverseGeocode(lat, lng);
        },
        (error) => {
          console.warn('Home Geolocation failed, using default name', error);
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }

  reverseGeocode(lat: number, lng: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    this.http.get<any>(url, {
      headers: { 'Accept-Language': 'id' }
    }).subscribe({
      next: (res) => {
        if (res && res.address) {
          const city = res.address.city || res.address.town || res.address.municipality || res.address.county || res.address.state || '';
          if (city) {
            this.currentLocationName = city;
          }
        }
      },
      error: (err) => {
        console.warn('Home reverse geocode failed', err);
      }
    });
  }

  get viewState() {
    if (this.attendanceService.state === 'checked_in') return 'checked_in';
    if (this.attendanceService.hasCompletedToday) return 'completed';
    return 'default';
  }

  toggleShortcuts() {
    this.showShortcuts = !this.showShortcuts;
  }

  onSwipeCheckIn() {
    this.router.navigate(['/attendance/validation']);
  }
}
