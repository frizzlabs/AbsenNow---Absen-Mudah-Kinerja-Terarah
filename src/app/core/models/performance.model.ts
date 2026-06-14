export interface Performance {
  id: string;
  employeeId: string;
  period: string; // Q1 2024, etc.
  score: number; // e.g., 4.5
  feedback: string;
  kpis: {
    name: string;
    target: number;
    achieved: number;
  }[];
}
