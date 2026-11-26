import { inject, Injectable, signal } from '@angular/core';

import type { AppNotification } from '../models/notification';

import { AuthService } from './auth.service';
import { DriverAssignmentService } from './driver-assignment.service';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notice-board-animal',
    title: 'Neue Tieraufnahme',
    description: 'Kater Findus wartet auf seine Erstuntersuchung und eine passende Pflegestelle.',
    date: '2026-11-26T09:00:00',
    category: 'Verein',
    read: false,
    userId: 'user-board',
    role: 'board',
  },
  {
    id: 'notice-foster-vet',
    title: 'Tierarzttermin für Milo',
    description: 'Milos Kontrolltermin ist heute um 15:30 Uhr in der Tierarztpraxis am Park.',
    date: '2026-11-26T08:30:00',
    category: 'Tier',
    read: false,
    userId: 'user-foster',
    role: 'foster',
  },
  {
    id: 'notice-foster-report',
    title: 'Wochenbericht für Luna',
    description: 'Bitte ergänze bis morgen den kurzen Wochenbericht für Luna.',
    date: '2026-11-25T13:15:00',
    category: 'Aufgabe',
    read: true,
    userId: 'user-foster',
    role: 'foster',
  },
  {
    id: 'notice-treasurer-receipt',
    title: 'Neuer Beleg wartet auf Zuordnung',
    description: 'Der Apothekenbeleg für Milo wurde eingereicht und ist noch nicht zugeordnet.',
    date: '2026-11-26T10:15:00',
    category: 'Finanzen',
    read: false,
    userId: 'user-treasurer',
    role: 'treasurer',
  },
  {
    id: 'notice-treasurer-approval',
    title: 'Kostenfreigabe erforderlich',
    description: 'Eine neue Tierarztrechnung wartet auf Prüfung und Freigabe.',
    date: '2026-11-25T16:45:00',
    category: 'Finanzen',
    read: true,
    userId: 'user-treasurer',
    role: 'treasurer',
  },
  {
    id: 'notice-driver-trip-1',
    title: 'Fahrt FA-2026-001 steht an',
    description: 'Heute um 14:30 Uhr Milo bei der Pflegestelle Sonnenhof abholen.',
    date: '2026-11-26T07:45:00',
    category: 'Fahrt',
    read: false,
    userId: 'user-driver',
    role: 'driver',
    assignmentId: 'trip-1',
  },
  {
    id: 'notice-driver-other-trip',
    title: 'Fahrt FA-2026-005 steht an',
    description: 'Morgen Peppa bei der Pflegestelle Pfoten-Zuhause abholen.',
    date: '2026-11-26T07:50:00',
    category: 'Fahrt',
    read: false,
    userId: 'user-driver-other',
    role: 'driver',
    assignmentId: 'trip-5',
  },
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly authService = inject(AuthService);
  private readonly driverAssignmentService = inject(DriverAssignmentService);
  private readonly notificationsState = signal<AppNotification[]>(INITIAL_NOTIFICATIONS);

  getNotificationsForCurrentUser(): readonly AppNotification[] {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return [];
    }

    const visible = this.notificationsState().filter((notification) => {
      if (user.role === 'board') {
        return true;
      }

      if (notification.userId !== user.id || notification.role !== user.role) {
        return false;
      }

      if (user.role === 'driver') {
        const assignments = this.driverAssignmentService.getAssignmentsForCurrentUser();
        return Boolean(
          notification.assignmentId && assignments.some((assignment) => assignment.id === notification.assignmentId),
        );
      }

      return user.role !== 'treasurer' || notification.category === 'Finanzen';
    });

    return [...visible].sort((a, b) => b.date.localeCompare(a.date));
  }

  getUnreadCountForCurrentUser(): number {
    return this.getNotificationsForCurrentUser().filter((notification) => !notification.read).length;
  }

  getNotificationForCurrentUser(id: string): AppNotification | null {
    return this.getNotificationsForCurrentUser().find((notification) => notification.id === id) ?? null;
  }

  markAsRead(id: string): AppNotification | null {
    const notification = this.getNotificationForCurrentUser(id);
    if (!notification || notification.read) {
      return notification;
    }

    const updated = { ...notification, read: true };
    this.notificationsState.update((notifications) =>
      notifications.map((current) => (current.id === id ? updated : current)),
    );
    return updated;
  }
}
