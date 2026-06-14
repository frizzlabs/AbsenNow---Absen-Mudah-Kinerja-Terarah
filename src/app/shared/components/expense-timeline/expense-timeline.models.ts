export interface TimelineStep {
  title: string;
  subtitle: string;
  time: string;
  status: 'success' | 'warning' | 'danger' | 'medium';
}
