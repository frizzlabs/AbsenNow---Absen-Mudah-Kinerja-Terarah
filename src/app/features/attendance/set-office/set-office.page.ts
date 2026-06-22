import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
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
  offices: any[] = [];
  selectedOfficeId: number | null = null;

  officeName = 'Kantor Pusat';
  lat = -6.200000;
  lng = 106.816666;
  radius = 100;
  address = '';
  isLoading = true;
  isSaving = false;
  isFetchingLocation = false;
  isGeocoding = false;
  workStart = '09:00';
  workEnd = '17:00';

  searchQuery = '';
  searchResults: any[] = [];
  isSearching = false;
  showResults = false;
  showOfficeDropdown = false;

  geofenceType: 'circle' | 'polygon' = 'circle';
  polygonCoordinates: Array<{ lat: number, lng: number }> = [];
  private polygonMarkers: L.Marker[] = [];
  private leafletPolygon: L.Polygon | null = null;

  get selectedOfficeLabel(): string {
    if (this.selectedOfficeId === null) {
      return '+ Tambah Kantor Baru';
    }
    const o = this.offices.find(x => x.id === this.selectedOfficeId);
    return o ? o.name : '+ Tambah Kantor Baru';
  }

  selectOfficeCustom(val: string | number | null) {
    this.showOfficeDropdown = false;
    const value = val === null ? 'new' : val.toString();
    const mockEvent = { target: { value } };
    this.selectOffice(mockEvent);
  }

  private searchTimer: any = null;
  private geocodeSub: Subscription | null = null;
  private searchSub: Subscription | null = null;

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
        this.offices = offices || [];
        if (this.offices.length > 0) {
          const o = this.offices[0];
          this.selectedOfficeId = o.id;
          this.officeName = o.name || this.officeName;
          this.lat = parseFloat(o.latitude);
          this.lng = parseFloat(o.longitude);
          this.radius = o.radius_meters || 100;
          if (o.work_start) this.workStart = o.work_start.substring(0, 5);
          if (o.work_end) this.workEnd = o.work_end.substring(0, 5);

          // Parse polygon coordinates
          if (o.polygon_coordinates && Array.isArray(o.polygon_coordinates) && o.polygon_coordinates.length >= 3) {
            this.polygonCoordinates = o.polygon_coordinates;
            this.geofenceType = 'polygon';
          } else {
            this.polygonCoordinates = [];
            this.geofenceType = 'circle';
          }
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

  selectOffice(event: any) {
    const val = event.target.value;
    if (val === 'new') {
      this.selectedOfficeId = null;
      this.officeName = '';
      this.lat = -6.200000;
      this.lng = 106.816666;
      this.radius = 100;
      this.workStart = '09:00';
      this.workEnd = '17:00';
      this.polygonCoordinates = [];
      this.geofenceType = 'circle';
      this.resetPolygon();
      this.setPoint(this.lat, this.lng, true);
      if (this.map) {
        this.map.setView([this.lat, this.lng], 16);
        this.drawPolygonOnMap();
        this.updateMapLayersVisibility();
      }
    } else {
      const id = parseInt(val, 10);
      const o = this.offices.find(x => x.id === id);
      if (o) {
        this.selectedOfficeId = o.id;
        this.officeName = o.name || '';
        this.lat = parseFloat(o.latitude);
        this.lng = parseFloat(o.longitude);
        this.radius = o.radius_meters || 100;
        if (o.work_start) this.workStart = o.work_start.substring(0, 5);
        if (o.work_end) this.workEnd = o.work_end.substring(0, 5);

        // Parse polygon coordinates
        if (o.polygon_coordinates && Array.isArray(o.polygon_coordinates) && o.polygon_coordinates.length >= 3) {
          this.polygonCoordinates = o.polygon_coordinates;
          this.geofenceType = 'polygon';
        } else {
          this.polygonCoordinates = [];
          this.geofenceType = 'circle';
        }

        this.resetPolygon();
        this.setPoint(this.lat, this.lng, true);
        if (this.map) {
          this.map.setView([this.lat, this.lng], 16);
          this.drawPolygonOnMap();
          this.updateMapLayersVisibility();
        }
      }
    }
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
        if (this.geofenceType === 'circle') {
          const pos = this.marker!.getLatLng();
          this.setPoint(pos.lat, pos.lng, false);
        }
      });

      // Klik peta → pindahkan pin atau tambah titik polygon
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        if (this.geofenceType === 'polygon') {
          this.addPolygonPoint(e.latlng.lat, e.latlng.lng);
        } else {
          this.setPoint(e.latlng.lat, e.latlng.lng, true);
        }
      });

      this.drawPolygonOnMap();
      this.updateMapLayersVisibility();
    }, 150);
  }

  private setPoint(lat: number, lng: number, moveMarker: boolean, knownAddress?: string) {
    this.lat = lat;
    this.lng = lng;
    if (moveMarker && this.marker) {
      this.marker.setLatLng([lat, lng]);
    }
    if (this.circle) {
      this.circle.setLatLng([lat, lng]);
    }
    if (knownAddress !== undefined) {
      this.address = knownAddress;
      if (this.geocodeSub) {
        this.geocodeSub.unsubscribe();
      }
      this.isGeocoding = false;
    } else {
      this.reverseGeocode();
    }
  }

  setGeofenceType(type: 'circle' | 'polygon') {
    this.geofenceType = type;
    if (this.map) {
      this.updateMapLayersVisibility();
    }
  }

  updateMapLayersVisibility() {
    if (!this.map) return;

    if (this.geofenceType === 'circle') {
      if (this.marker && !this.map.hasLayer(this.marker)) {
        this.marker.addTo(this.map);
      }
      if (this.circle && !this.map.hasLayer(this.circle)) {
        this.circle.addTo(this.map);
      }
      if (this.leafletPolygon) {
        this.map.removeLayer(this.leafletPolygon);
      }
      this.polygonMarkers.forEach(m => this.map?.removeLayer(m));
    } else {
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      if (this.circle) {
        this.map.removeLayer(this.circle);
      }
      if (this.leafletPolygon) {
        this.leafletPolygon.addTo(this.map);
      }
      this.polygonMarkers.forEach(m => this.map && m.addTo(this.map));
    }
  }

  addPolygonPoint(lat: number, lng: number) {
    if (!this.map) return;

    const coords = { lat, lng };
    this.polygonCoordinates.push(coords);

    const vertexIcon = L.divIcon({
      className: 'polygon-vertex-icon',
      html: `<div style="width: 10px; height: 10px; background-color: #1B59F8; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });

    const marker = L.marker([lat, lng], { icon: vertexIcon }).addTo(this.map);
    this.polygonMarkers.push(marker);

    this.drawPolygonOnMap();
  }

  undoLastPoint() {
    if (this.polygonCoordinates.length === 0) return;

    this.polygonCoordinates.pop();
    const lastMarker = this.polygonMarkers.pop();
    if (lastMarker && this.map) {
      this.map.removeLayer(lastMarker);
    }

    this.drawPolygonOnMap();
  }

  resetPolygon() {
    if (!this.map) {
      this.polygonCoordinates = [];
      this.polygonMarkers = [];
      this.leafletPolygon = null;
      return;
    }

    this.polygonCoordinates = [];
    this.polygonMarkers.forEach(m => this.map?.removeLayer(m));
    this.polygonMarkers = [];

    if (this.leafletPolygon) {
      this.map.removeLayer(this.leafletPolygon);
      this.leafletPolygon = null;
    }
  }

  drawPolygonOnMap() {
    if (!this.map) return;

    if (this.leafletPolygon) {
      this.map.removeLayer(this.leafletPolygon);
      this.leafletPolygon = null;
    }

    if (this.polygonMarkers.length === 0 && this.polygonCoordinates.length > 0) {
      const vertexIcon = L.divIcon({
        className: 'polygon-vertex-icon',
        html: `<div style="width: 10px; height: 10px; background-color: #1B59F8; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      });

      this.polygonCoordinates.forEach(c => {
        const m = L.marker([c.lat, c.lng], { icon: vertexIcon });
        if (this.geofenceType === 'polygon') {
          m.addTo(this.map!);
        }
        this.polygonMarkers.push(m);
      });
    }

    if (this.polygonCoordinates.length > 0) {
      const latLngs = this.polygonCoordinates.map(c => [c.lat, c.lng] as L.LatLngExpression);
      this.leafletPolygon = L.polygon(latLngs, {
        color: '#1B59F8',
        fillColor: '#1B59F8',
        fillOpacity: 0.12,
        weight: 3
      });

      if (this.geofenceType === 'polygon') {
        this.leafletPolygon.addTo(this.map);
      }
    }
  }

  onSearchInput() {
    clearTimeout(this.searchTimer);
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults = false;
      this.isSearching = false;
      if (this.searchSub) {
        this.searchSub.unsubscribe();
      }
      return;
    }
    this.isSearching = true;
    this.searchTimer = setTimeout(() => this.searchLocation(), 300);
  }

  searchLocation() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&countrycodes=id&limit=5`;
    this.searchSub = this.http.get<any[]>(url, { headers: { 'Accept-Language': 'id' } }).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.showResults = true;
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
      }
    });
  }

  selectResult(r: any) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    this.showResults = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.setPoint(lat, lng, true, r.display_name);
    if (this.map) {
      this.map.setView([lat, lng], 16);
      if (this.geofenceType === 'polygon') {
        this.resetPolygon();
        this.addPolygonPoint(lat, lng);
      }
    }
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
    if (!navigator.geolocation) {
      this.showToast('Geolocation tidak didukung oleh browser Anda.', 'danger');
      return;
    }
    this.isFetchingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.isFetchingLocation = false;
        const { latitude, longitude } = pos.coords;
        this.setPoint(latitude, longitude, true);
        if (this.map) {
          this.map.setView([latitude, longitude], 16);
          if (this.geofenceType === 'polygon') {
            this.resetPolygon();
            this.addPolygonPoint(latitude, longitude);
          }
        }
      },
      (err) => {
        this.isFetchingLocation = false;
        this.showToast('Tidak dapat mengambil lokasi GPS.', 'danger');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  reverseGeocode() {
    if (this.geocodeSub) {
      this.geocodeSub.unsubscribe();
    }
    this.isGeocoding = true;
    this.address = 'Mencari alamat...';
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.lat}&lon=${this.lng}`;
    this.geocodeSub = this.http.get<any>(url, { headers: { 'Accept-Language': 'id' } }).subscribe({
      next: (res) => {
        this.address = res?.display_name || `${this.lat.toFixed(6)}, ${this.lng.toFixed(6)}`;
        this.isGeocoding = false;
      },
      error: () => {
        this.address = `${this.lat.toFixed(6)}, ${this.lng.toFixed(6)}`;
        this.isGeocoding = false;
      }
    });
  }

  async save() {
    if (this.isSaving) return;

    if (this.geofenceType === 'polygon' && this.polygonCoordinates.length < 3) {
      await this.showToast('Gambar polygon minimal harus memiliki 3 titik koordinat.', 'warning');
      return;
    }

    this.isSaving = true;
    const loading = await this.loadingCtrl.create({ message: 'Menyimpan lokasi kantor...' });
    await loading.present();

    let finalLat = this.lat;
    let finalLng = this.lng;

    if (this.geofenceType === 'polygon' && this.polygonCoordinates.length >= 3) {
      let sumLat = 0;
      let sumLng = 0;
      this.polygonCoordinates.forEach(c => {
        sumLat += c.lat;
        sumLng += c.lng;
      });
      finalLat = sumLat / this.polygonCoordinates.length;
      finalLng = sumLng / this.polygonCoordinates.length;
    }

    const payload = {
      name: this.officeName?.trim() || 'Kantor',
      latitude: finalLat,
      longitude: finalLng,
      radius_meters: this.geofenceType === 'circle' ? this.radius : null,
      work_start: this.workStart ? this.workStart + ':00' : null,
      work_end: this.workEnd ? this.workEnd + ':00' : null,
      polygon_coordinates: this.geofenceType === 'polygon' ? this.polygonCoordinates : null
    };

    const request = this.selectedOfficeId
      ? this.attendanceService.updateOffice(this.selectedOfficeId, payload)
      : this.attendanceService.createOffice(payload);

    request.subscribe({
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
