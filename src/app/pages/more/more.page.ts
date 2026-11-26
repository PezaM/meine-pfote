import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular';

import type { PermissionArea } from '../../services/permission.service';
import { PermissionService } from '../../services/permission.service';

interface MoreLink {
  area: PermissionArea;
  label: string;
  path: string;
  icon: string;
}

const MORE_LINKS: readonly MoreLink[] = [
  { area: 'receipts', label: 'Belege', path: 'receipts', icon: 'receipt-outline' },
  { area: 'reports', label: 'Berichte', path: 'reports', icon: 'document-text-outline' },
  {
    area: 'notifications',
    label: 'Benachrichtigungen',
    path: 'notifications',
    icon: 'notifications-outline',
  },
  {
    area: 'driver-assignments',
    label: 'Fahrten',
    path: 'driver-assignments',
    icon: 'car-outline',
  },
  { area: 'profile', label: 'Profil', path: 'profile', icon: 'person-outline' },
];

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
  imports: [IonContent, IonIcon, IonItem, IonLabel, IonList, RouterLink],
})
export class MorePage {
  private readonly permissionService = inject(PermissionService);

  readonly links = MORE_LINKS.filter((link) => this.permissionService.canAccess(link.area));
}
