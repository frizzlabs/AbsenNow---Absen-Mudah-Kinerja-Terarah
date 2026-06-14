import { Injectable } from '@angular/core';

export type AttendanceState = 'checked_out' | 'checked_in';

@Injectable({
  providedIn: 'root'
})
export class AttendanceStateService {
  private _state: AttendanceState = 'checked_out';
  private _hasCompletedToday: boolean = false;

  get state(): AttendanceState {
    return this._state;
  }

  get hasCompletedToday(): boolean {
    return this._hasCompletedToday;
  }

  performCheckIn() {
    this._state = 'checked_in';
  }

  performCheckOut() {
    this._state = 'checked_out';
    this._hasCompletedToday = true;
  }
}
