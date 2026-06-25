import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { DinasLuarService } from '../../../../core/services/dinas-luar.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-ajukan',
  templateUrl: './ajukan.page.html',
  styleUrls: ['./ajukan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent, ButtonComponent, BottomNavComponent]
})
export class AjukanPage implements OnInit, OnDestroy {
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private circle: L.Circle | null = null;
  private searchDebounce: any = null;

  radiusOptions = [100, 200, 500, 1000, 2000];
  address = '';
  gettingLocation = false;
  searchQuery = '';
  searchResults: { display_name: string; lat: string; lon: string }[] = [];
  isSearching = false;
  showResults = false;

  constructor(
    public dinasService: DinasLuarService,
    private router: Router,
    private http: HttpClient,
    private toastCtrl: ToastController
  ) {}

  get draft() { return this.dinasService.draft; }

  ngOnInit() {
    this.dinasService.resetDraft();
    this.initMap();
  }

  ngOnDestroy() {
    this.map?.remove();
    this.map = null;
  }

  initMap() {
    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    });
    L.Marker.prototype.options.icon = icon;

    const defLat = this.draft.latitude ?? -6.2;
    const defLng = this.draft.longitude ?? 106.816;

    setTimeout(() => {
      const el = document.getElementById('dinas-map');
      if (!el) return;
      this.map = L.map('dinas-map').setView([defLat, defLng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

      this.marker = L.marker([defLat, defLng], { draggable: true }).addTo(this.map);
      this.circle = L.circle([defLat, defLng], { color: '#1B59F8', fillColor: '#1B59F8', fillOpacity: 0.12, radius: this.draft.radius }).addTo(this.map);

      this.marker.on('dragend', () => {
        const p = this.marker!.getLatLng();
        this.setPoint(p.lat, p.lng, false);
      });
      this.map.on('click', (e: L.LeafletMouseEvent) => this.setPoint(e.latlng.lat, e.latlng.lng, true));

      if (!this.draft.latitude) {
        this.useMyLocation();
      }
    }, 150);
  }

  setPoint(lat: number, lng: number, moveMarker: boolean) {
    this.draft.latitude = lat;
    this.draft.longitude = lng;
    if (moveMarker) this.marker?.setLatLng([lat, lng]);
    this.circle?.setLatLng([lat, lng]);
    this.reverseGeocode(lat, lng);
  }

  selectRadius(r: number) {
    this.draft.radius = r;
    this.circle?.setRadius(r);
  }

  useMyLocation() {
    if (!navigator.geolocation) return;
    this.gettingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.gettingLocation = false;
        const { latitude, longitude } = pos.coords;
        this.setPoint(latitude, longitude, true);
        this.map?.setView([latitude, longitude], 16);
      },
      () => {
        this.gettingLocation = false;
        this.showToast('Tidak dapat mengambil lokasi GPS.', 'danger');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  onSearchInput() {
    clearTimeout(this.searchDebounce);
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults = false;
      return;
    }
    this.searchDebounce = setTimeout(() => this.searchLocation(), 500);
  }

  searchLocation() {
    if (!this.searchQuery.trim()) return;
    this.isSearching = true;
    this.showResults = false;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&limit=5&countrycodes=id`;
    this.http.get<any[]>(url, { headers: { 'Accept-Language': 'id' } }).subscribe({
      next: (results) => {
        this.isSearching = false;
        this.searchResults = results;
        this.showResults = results.length > 0;
      },
      error: () => { this.isSearching = false; }
    });
  }

  selectResult(result: { display_name: string; lat: string; lon: string }) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    this.searchQuery = result.display_name.split(',')[0];
    this.searchResults = [];
    this.showResults = false;
    this.setPoint(lat, lng, true);
    this.map?.setView([lat, lng], 16);
  }

  closeSearch() {
    setTimeout(() => { this.showResults = false; }, 200);
  }

  reverseGeocode(lat: number, lng: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    this.http.get<any>(url, { headers: { 'Accept-Language': 'id' } }).subscribe({
      next: (res) => {
        this.address = res?.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        if (!this.draft.locationName) this.draft.locationName = res?.address?.city_district || res?.address?.suburb || res?.address?.city || '';
      },
      error: () => { this.address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`; }
    });
  }

  get isValid(): boolean {
    const d = this.draft;
    return !!(d.latitude && d.longitude && d.locationName?.trim() && d.startDatetime && d.endDatetime && d.workDetails?.length >= 10);
  }

  goNext() {
    if (!this.isValid) return;
    this.router.navigate(['/dinas-luar/confirm']);
  }

  async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2500, position: 'top', color });
    await t.present();
  }
}
