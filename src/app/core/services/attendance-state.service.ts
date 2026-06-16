import { Injectable } from '@angular/core';
import { AttendanceService } from './attendance.service';

export type AttendanceState = 'checked_out' | 'checked_in';

@Injectable({
  providedIn: 'root'
})
export class AttendanceStateService {
  private _state: AttendanceState = 'checked_out';
  private _hasCompletedToday: boolean = false;

  constructor(private apiService: AttendanceService) {}

  get state(): AttendanceState {
    return this._state;
  }

  get hasCompletedToday(): boolean {
    return this._hasCompletedToday;
  }

  syncStatus(): Promise<void> {
    return new Promise((resolve) => {
      this.apiService.getStatusToday().subscribe({
        next: (res) => {
          if (res.state === 'checked_in') {
            this._state = 'checked_in';
            this._hasCompletedToday = false;
          } else if (res.state === 'completed') {
            this._state = 'checked_out';
            this._hasCompletedToday = true;
          } else {
            this._state = 'checked_out';
            this._hasCompletedToday = false;
          }
          resolve();
        },
        error: (err) => {
          console.error('Error fetching today status', err);
          this._state = 'checked_out';
          this._hasCompletedToday = false;
          resolve();
        }
      });
    });
  }

  performCheckIn() {
    this._state = 'checked_in';
  }

  performCheckOut() {
    this._state = 'checked_out';
    this._hasCompletedToday = true;
  }
}
