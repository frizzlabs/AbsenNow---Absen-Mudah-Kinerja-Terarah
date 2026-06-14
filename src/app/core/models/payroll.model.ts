export interface Payslip {
  id: string;
  employeeId: string;
  period: string; // YYYY-MM
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'pending';
  documentUrl?: string;
}
