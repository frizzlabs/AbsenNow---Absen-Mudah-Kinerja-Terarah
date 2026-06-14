export interface Attendance {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // ISO 8601
  checkOutTime?: string; // ISO 8601
  status: 'present' | 'absent' | 'late' | 'half-day';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  validationMethod?: 'face' | 'qr' | 'location';
  isCorrected?: boolean;
}
