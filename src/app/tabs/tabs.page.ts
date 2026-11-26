import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  carOutline,
  documentTextOutline,
  ellipsisHorizontalOutline,
  homeOutline,
  notificationsOutline,
  peopleOutline,
  pawOutline,
  personOutline,
  receiptOutline,
  wifiOutline,
  cloudOfflineOutline,
} from 'ionicons/icons';

import type { UserRole } from '../models/user';
import { USER_ROLE_LABELS } from '../models/user';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import type { PermissionArea } from '../services/permission.service';
import { PermissionService } from '../services/permission.service';
import { RoleService } from '../services/role.service';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  area?: PermissionArea;
}

const ROLE_NAVIGATION: Record<UserRole, readonly NavigationItem[]> = {
  board: [
    { label: 'Dashboard', path: 'dashboard', icon: 'home-outline', area: 'dashboard' },
    { label: 'Tiere', path: 'animals', icon: 'paw-outline', area: 'animals' },
    { label: 'Pflegestellen', path: 'foster-homes', icon: 'people-outline', area: 'foster-homes' },
    { label: 'Kosten', path: 'costs', icon: 'cash-outline', area: 'costs' },
    { label: 'Mehr', path: 'more', icon: 'ellipsis-horizontal-outline' },
  ],
  foster: [
    { label: 'Dashboard', path: 'dashboard', icon: 'home-outline', area: 'dashboard' },
    { label: 'Meine Tiere', path: 'animals', icon: 'paw-outline', area: 'animals' },
    {
      label: 'Benachrichtigungen',
      path: 'notifications',
      icon: 'notifications-outline',
      area: 'notifications',
    },
    { label: 'Profil', path: 'profile', icon: 'person-outline', area: 'profile' },
  ],
  treasurer: [
    { label: 'Dashboard', path: 'dashboard', icon: 'home-outline', area: 'dashboard' },
    { label: 'Kosten', path: 'costs', icon: 'cash-outline', area: 'costs' },
    { label: 'Belege', path: 'receipts', icon: 'receipt-outline', area: 'receipts' },
    { label: 'Berichte', path: 'reports', icon: 'document-text-outline', area: 'reports' },
    { label: 'Pflegestellen', path: 'foster-homes', icon: 'people-outline', area: 'foster-homes' },
  ],
  driver: [
    { label: 'Dashboard', path: 'dashboard', icon: 'home-outline', area: 'dashboard' },
    {
      label: 'Meine Einsätze',
      path: 'driver-assignments',
      icon: 'car-outline',
      area: 'driver-assignments',
    },
    {
      label: 'Benachrichtigungen',
      path: 'notifications',
      icon: 'notifications-outline',
      area: 'notifications',
    },
    { label: 'Profil', path: 'profile', icon: 'person-outline', area: 'profile' },
  ],
};

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [
    IonButton,
    IonBadge,
    IonButtons,
    IonHeader,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonToolbar,
    RouterLink,
    RouterLinkActive,
  ],
})
export class TabsPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);
  private readonly notificationService = inject(NotificationService);

  readonly currentUser = this.authService.getCurrentUser();
  readonly roleLabel = this.currentUser ? USER_ROLE_LABELS[this.currentUser.role] : '';
  readonly navigation = this.getNavigation();
  readonly isOnline = signal(typeof navigator !== 'undefined' && navigator.onLine);

  get unreadNotificationCount(): number {
    return this.notificationService.getUnreadCountForCurrentUser();
  }

  constructor() {
    const handleOnline = () => this.isOnline.set(true);
    const handleOffline = () => this.isOnline.set(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      });
    }

    addIcons({
      cashOutline,
      carOutline,
      cloudOfflineOutline,
      documentTextOutline,
      ellipsisHorizontalOutline,
      homeOutline,
      notificationsOutline,
      pawOutline,
      peopleOutline,
      personOutline,
      receiptOutline,
      wifiOutline,
    });
  }

  logout(): void {
    void this.authService.logout();
  }

  private getNavigation(): readonly NavigationItem[] {
    const role = this.roleService.getCurrentRole();

    if (!role) {
      return [];
    }

    return ROLE_NAVIGATION[role].filter((item) => !item.area || this.permissionService.canAccess(item.area, role));
  }
}
