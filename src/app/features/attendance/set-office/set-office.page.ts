import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { AttendanceService } from '../../../core/services/attendance.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-set-office',
  templateUrl: './set-office.page.html',
  styleUrls: ['./set-office.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent]
})
export class SetOfficePage implements OnInit {
  officeName = 'Kantor Pusat';
  lat = -6.200000;
  lng = 106.816666;
  radius = 100;
  address = '';
  isLoading = true;
  isSaving = false;

  searchQuery = '';
  searchResults: any[] = [];
  isSearching = false;
  showResults = false;
  private searchTimer: any = null;

  radiusOptions = [50, 100, 200, 500];

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private circle: L.Circle | null = null;

  constructor(
    private router: Router,
    private location: Location,
    private http: HttpClient,
    private attendanceService: AttendanceService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.attendanceService.getOffices().subscribe({
      next: (offices) => {
        if (offices && offices.length > 0) {
          const o = offices[0];
          this.officeName = o.name || this.officeName;
          this.lat = parseFloat(o.latitude);
          this.lng = parseFloat(o.longitude);
          this.radius = o.radius_meters || 100;
        }
        this.isLoading = false;
        this.initMap();
        this.reverseGeocode();
      },
      error: () => {
        this.isLoading = false;
        this.initMap();
        this.reverseGeocode();
      }
    });
  }

  initMap() {
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = defaultIcon;

    setTimeout(() => {
      const el = document.getElementById('set-office-map');
      if (!el) return;

      this.map = L.map('set-office-map', { zoomControl: true }).setView([this.lat, this.lng], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(this.map);

      this.marker = L.marker([this.lat, this.lng], { draggable: true }).addTo(this.map);
      this.circle = L.circle([this.lat, this.lng], {
        color: '#1B59F8',
        fillColor: '#1B59F8',
        fillOpacity: 0.12,
        radius: this.radius
      }).addTo(this.map);

      // Geser pin → update koordinat
      this.marker.on('dragend', () => {
        const pos = this.marker!.getLatLng();
        this.setPoint(pos.lat, pos.lng, false);
      });

      // Klik peta → pindahkan pin
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.setPoint(e.latlng.lat, e.latlng.lng, true);
      });
    }, 150);
  }

  private setPoint(lat: number, lng: number, moveMarker: boolean) {
    this.lat = lat;
    this.lng = lng;
    if (moveMarker && this.marker) {
      this.marker.setLatLng([lat, lng]);
    }
    if (this.circle) {
      this.circle.setLatLng([lat, lng]);
    }
    this.reverseGeocode();
  }

  onSearchInput() {
    clearTimeout(this.searchTimer);
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults = false;
      return;
    }
    this.searchTimer = setTimeout(() => this.searchLocation(), 500);
  }

  searchLocation() {
    this.isSearching = true;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&countrycodes=id&limit=5`;
    this.http.get<any[]>(url, { headers: { 'Accept-Language': 'id' } }).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.showResults = true;
        this.isSearching = false;
      },
      error: () => { this.isSearching = false; }
    });
  }

  selectResult(r: any) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    this.showResults = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.setPoint(lat, lng, true);
    if (this.map) this.map.setView([lat, lng], 16);
  }

  closeSearch() {
    setTimeout(() => { this.showResults = false; }, 150);
  }

  selectRadius(r: number) {
    this.radius = r;
    if (this.circle) {
      this.circle.setRadius(r);
    }
    if (this.map) {
      this.map.setView([this.lat, this.lng], this.map.getZoom());
    }
  }

  useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this.setPoint(latitude, longitude, true);
        if (this.map) this.map.setView([latitude, longitude], 16);
      },
      () => this.showToast('Tidak dapat mengambil lokasi GPS.', 'danger'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  reverseGeocode() {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.lat}&lon=${this.lng}`;
    this.http.get<any>(url, { headers: { 'Accept-Language': 'id' } }).subscribe({
      next: (res) => {
        this.address = res?.display_name || `${this.lat.toFixed(6)}, ${this.lng.toFixed(6)}`;
      },
      error: () => {
        this.address = `${this.lat.toFixed(6)}, ${this.lng.toFixed(6)}`;
      }
    });
  }

  async save() {
    if (this.isSaving) return;
    this.isSaving = true;
    const loading = await this.loadingCtrl.create({ message: 'Menyimpan lokasi kantor...' });
    await loading.present();

    this.attendanceService.setOfficeLocation(this.lat, this.lng, this.radius, this.officeName?.trim() || 'Kantor').subscribe({
      next: async () => {
        loading.dismiss();
        this.isSaving = false;
        await this.showToast('Lokasi kantor berhasil disimpan.', 'success');
        this.location.back();
      },
      error: async (err) => {
        loading.dismiss();
        this.isSaving = false;
        await this.showToast(err.error?.message || 'Gagal menyimpan lokasi kantor.', 'danger');
      }
    });
  }

  goBack() {
    this.location.back();
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2500, position: 'top', color });
    await toast.present();
  }
}
