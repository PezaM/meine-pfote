import type { UserRole } from './user';

export type NotificationCategory = 'Verein' | 'Tier' | 'Aufgabe' | 'Finanzen' | 'Fahrt';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  date: string;
  category: NotificationCategory;
  read: boolean;
  userId: string;
  role: UserRole;
  assignmentId?: string;
}
