import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonNote,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmarkDoneOutline, notificationsOutline } from 'ionicons/icons';

import type { AppNotification, NotificationCategory } from '../../models/notification';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  imports: [
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonIcon,
    IonNote,
    RouterLink,
  ],
})
export class NotificationsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  readonly notificationId = this.route.snapshot.paramMap.get('id');
  private readonly dateFormatter = new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  statusMessage = '';

  constructor() {
    addIcons({ arrowBackOutline, checkmarkDoneOutline, notificationsOutline });
  }

  get notifications(): readonly AppNotification[] {
    return this.notificationService.getNotificationsForCurrentUser();
  }

  get notification(): AppNotification | null {
    return this.notificationId ? this.notificationService.getNotificationForCurrentUser(this.notificationId) : null;
  }

  get unreadCount(): number {
    return this.notificationService.getUnreadCountForCurrentUser();
  }

  formatDate(date: string): string {
    return this.dateFormatter.format(new Date(date));
  }

  categoryColor(category: NotificationCategory): 'primary' | 'success' | 'warning' | 'tertiary' | 'medium' {
    switch (category) {
      case 'Verein':
        return 'primary';
      case 'Tier':
        return 'success';
      case 'Aufgabe':
        return 'warning';
      case 'Finanzen':
        return 'tertiary';
      case 'Fahrt':
        return 'medium';
    }
  }

  markAsRead(notification: AppNotification): void {
    const updated = this.notificationService.markAsRead(notification.id);
    this.statusMessage = updated?.read ? 'Benachrichtigung als gelesen markiert.' : 'Benachrichtigung nicht gefunden.';
  }
}
