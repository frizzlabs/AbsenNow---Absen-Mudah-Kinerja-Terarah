export interface User {
  id: string;
  email: string;
  role: 'admin' | 'employee' | 'manager';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
