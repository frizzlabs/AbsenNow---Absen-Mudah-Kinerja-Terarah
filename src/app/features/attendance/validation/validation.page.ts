import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { RouterModule, Router } from '@angular/router';
import { AttendanceStateService } from '../../../core/services/attendance-state.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { RoleService } from '../../../core/services/role.service';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-validation',
  templateUrl: './validation.page.html',
  styleUrls: ['./validation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ButtonComponent, RouterModule]
})
export class ValidationPage implements OnInit {
  @ViewChild('bottomSheet', { static: false }) bottomSheet!: ElementRef;

  isCheckingOut = false;
  isLoading = true;
  isWithinRadius = false;
  distance = 0;
  isMockGpsUsed = false;
  currentTime = '';
  isMinimized = false;
  sheetTransform: string | null = null;
  private startY = 0;
  private startTranslate = 0;
  private maxTranslate = 0;
  private isDragging = false;
  private dragged = false;

  officeName = 'Karajo HQ - Tech Park';
  officeAddress = '123 Innovation Dr, Tech Park, Suite 400';
  officeLat = -6.200000;
  officeLng = 106.816666;
  officeRadius = 50;
  officeId = 1;

  userLat: number | null = null;
  userLng: number | null = null;

  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private officeMarker: L.Marker | null = null;
  private officeCircle: L.Circle | null = null;

  get canManageOffice(): boolean {
    return this.roleService.can('office.manage');
  }

  constructor(
    private attendanceStateService: AttendanceStateService,
    private attendanceService: AttendanceService,
    private roleService: RoleService,
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient
  ) {
    this.isCheckingOut = this.attendanceStateService.state === 'checked_in';
  }

  ngOnInit() {
    this.updateTime();
    this.loadOfficeAndLocation();
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  loadOfficeAndLocation() {
    this.isLoading = true;
    this.attendanceService.getOffices().subscribe({
      next: (offices) => {
        if (offices && offices.length > 0) {
          const office = offices[0];
          this.officeId = office.id;
          this.officeName = office.name;
          this.officeLat = parseFloat(office.latitude);
          this.officeLng = parseFloat(office.longitude);
          this.officeRadius = office.radius_meters;
        }
        this.getCurrentLocation();
      },
      error: (err) => {
        console.error('Error fetching offices', err);
        this.getCurrentLocation();
      }
    });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLat = position.coords.latitude;
          this.userLng = position.coords.longitude;
          this.isMockGpsUsed = false;
          this.checkRadius();
        },
        (error) => {
          console.warn('Geolocation failed, defaulting to mock coordinates', error);
          this.useMockLocation();
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    } else {
      console.warn('Geolocation not supported, defaulting to mock coordinates');
      this.useMockLocation();
    }
  }

  useMockLocation() {
    this.userLat = this.officeLat;
    this.userLng = this.officeLng;
    this.isMockGpsUsed = true;
    this.checkRadius();
  }

  checkRadius() {
    if (this.userLat !== null && this.userLng !== null) {
      this.distance = this.calculateDistance(
        this.userLat,
        this.userLng,
        this.officeLat,
        this.officeLng
      );
      
      this.isWithinRadius = this.distance <= this.officeRadius;
      
      localStorage.setItem('temp_lat', this.userLat.toString());
      localStorage.setItem('temp_lng', this.userLng.toString());
      localStorage.setItem('temp_office_id', this.officeId.toString());
      localStorage.setItem('temp_office_name', this.officeName);
      localStorage.setItem('temp_office_address', this.officeAddress);
      
      this.isLoading = false;
      this.initMap();
      this.reverseGeocode(this.officeLat, this.officeLng);
    }
  }

  reverseGeocode(lat: number, lng: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    this.http.get<any>(url, {
      headers: { 'Accept-Language': 'id' }
    }).subscribe({
      next: (res) => {
        if (res && res.display_name) {
          this.officeAddress = res.display_name;
          localStorage.setItem('temp_office_address', this.officeAddress);
        }
      },
      error: (err) => {
        console.warn('Reverse geocoding failed', err);
        this.officeAddress = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        localStorage.setItem('temp_office_address', this.officeAddress);
      }
    });
  }

  initMap() {
    if (this.userLat === null || this.userLng === null) return;

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = defaultIcon;

    setTimeout(() => {
      const mapContainer = document.getElementById('validation-map');
      if (!mapContainer) {
        console.warn('Map container element not found in DOM');
        return;
      }

      if (!this.map) {
        this.map = L.map('validation-map', {
          zoomControl: false
        }).setView([this.userLat!, this.userLng!], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(this.map);
      } else {
        this.map.setView([this.userLat!, this.userLng!], 15);
      }

      if (this.userMarker) this.map.removeLayer(this.userMarker);
      if (this.officeMarker) this.map.removeLayer(this.officeMarker);
      if (this.officeCircle) this.map.removeLayer(this.officeCircle);

      this.userMarker = L.marker([this.userLat!, this.userLng!])
        .addTo(this.map)
        .bindPopup('Your Location')
        .openPopup();

      this.officeMarker = L.marker([this.officeLat, this.officeLng])
        .addTo(this.map)
        .bindPopup(this.officeName);

      this.officeCircle = L.circle([this.officeLat, this.officeLng], {
        color: this.isWithinRadius ? '#2ec4b6' : '#e71d36',
        fillColor: this.isWithinRadius ? '#2ec4b6' : '#e71d36',
        fillOpacity: 0.15,
        radius: this.officeRadius
      }).addTo(this.map);

      const bounds = L.latLngBounds([
        [this.userLat!, this.userLng!],
        [this.officeLat, this.officeLng]
      ]);
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }, 100);
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const earthRadius = 6371000; // meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  roundDistance(dist: number): number {
    return Math.round(dist);
  }

  proceedToFaceValidation() {
    if (this.isWithinRadius) {
      this.router.navigate(['/attendance/face-validation']);
    }
  }

  goToSetOffice() {
    this.router.navigate(['/attendance/set-office']);
  }

  async updateOfficeLocationToCurrent() {
    if (this.userLat === null || this.userLng === null) {
      const toast = await this.toastController.create({
        message: 'Tidak dapat mendapatkan lokasi GPS Anda saat ini.',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;
    // Set lokasi kantor ke posisi GPS saat ini dengan radius geofence 100 meter
    this.attendanceService.updateOfficeCoordinates(this.userLat, this.userLng, 100).subscribe({
      next: async (res) => {
        this.officeLat = this.userLat!;
        this.officeLng = this.userLng!;
        if (res && res.office) {
          if (res.office.name) this.officeName = res.office.name;
          if (res.office.radius_meters) this.officeRadius = res.office.radius_meters;
        }
        this.checkRadius();

        const toast = await this.toastController.create({
          message: res.message || 'Lokasi kantor berhasil diperbarui.',
          duration: 3000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
      },
      error: async (err) => {
        this.isLoading = false;
        const errMsg = err.error?.message || 'Gagal memperbarui lokasi kantor.';
        const toast = await this.toastController.create({
          message: errMsg,
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  toggleMinimize() {
    if (this.dragged) {
      this.dragged = false;
      return;
    }
    this.isMinimized = !this.isMinimized;
    this.sheetTransform = null;
  }

  toggleHeaderClick(event: Event) {
    if (this.dragged) {
      this.dragged = false;
      return;
    }
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() !== 'a' && !target.closest('a')) {
      this.toggleMinimize();
    }
  }

  onPointerDown(event: PointerEvent) {
    const sheet = this.bottomSheet?.nativeElement;
    if (!sheet) return;

    this.isDragging = true;
    this.dragged = false;
    this.startY = event.clientY;
    
    const sheetHeight = sheet.offsetHeight;
    this.maxTranslate = Math.max(100, sheetHeight - 40);
    this.startTranslate = this.isMinimized ? this.maxTranslate : 0;
    
    sheet.style.transition = 'none';

    const target = event.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(event.pointerId);
    } catch (e) {
      console.warn('Pointer capture failed', e);
    }
  }

  onPointerMove(event: PointerEvent) {
    if (!this.isDragging) return;
    
    const currentY = event.clientY;
    const deltaY = currentY - this.startY;
    
    if (Math.abs(deltaY) > 5) {
      this.dragged = true;
    }
    
    let currentTranslate = this.startTranslate + deltaY;
    if (currentTranslate < 0) {
      currentTranslate = 0;
    } else if (currentTranslate > this.maxTranslate) {
      currentTranslate = this.maxTranslate;
    }
    
    this.sheetTransform = `translateY(${currentTranslate}px)`;
  }

  onPointerUp(event: PointerEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    
    const sheet = this.bottomSheet?.nativeElement;
    if (!sheet) return;
    
    sheet.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    const target = event.currentTarget as HTMLElement;
    try {
      target.releasePointerCapture(event.pointerId);
    } catch (e) {
      // ignore
    }
    
    let finalTranslate = 0;
    if (this.sheetTransform) {
      const match = this.sheetTransform.match(/translateY\(([^p]+)px\)/);
      if (match) {
        finalTranslate = parseFloat(match[1]);
      }
    }
    
    const threshold = this.maxTranslate * 0.3;
    if (this.isMinimized) {
      if (this.maxTranslate - finalTranslate > threshold) {
        this.isMinimized = false;
      }
    } else {
      if (finalTranslate > threshold) {
        this.isMinimized = true;
      }
    }
    
    this.sheetTransform = null;
  }
}
