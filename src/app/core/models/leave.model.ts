export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'unpaid' | 'maternity';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  documentUrl?: string;
  delegateEmployeeId?: string;
  createdAt: string;
}
