import { inject, Injectable } from '@angular/core';

import type { UserRole } from '../models/user';

import { AuthService } from './auth.service';
import { RoleService } from './role.service';

export type PermissionArea =
  | 'dashboard'
  | 'animals'
  | 'animal-details'
  | 'foster-homes'
  | 'costs'
  | 'receipts'
  | 'reports'
  | 'notifications'
  | 'driver-assignments'
  | 'profile';

const AREA_PERMISSIONS: Record<PermissionArea, readonly UserRole[]> = {
  dashboard: ['board', 'foster', 'treasurer', 'driver'],
  animals: ['board', 'foster', 'treasurer'],
  'animal-details': ['board', 'foster', 'treasurer', 'driver'],
  'foster-homes': ['board', 'foster', 'treasurer'],
  costs: ['board', 'foster', 'treasurer'],
  receipts: ['board', 'foster', 'treasurer'],
  reports: ['board', 'treasurer'],
  notifications: ['board', 'foster', 'treasurer', 'driver'],
  'driver-assignments': ['board', 'driver'],
  profile: ['board', 'foster', 'treasurer', 'driver'],
};

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);

  canAccess(area: PermissionArea, role = this.roleService.getCurrentRole()): boolean {
    return role !== null && AREA_PERMISSIONS[area].includes(role);
  }

  getAllowedAreas(role = this.roleService.getCurrentRole()): readonly PermissionArea[] {
    if (role === null) {
      return [];
    }

    return (Object.keys(AREA_PERMISSIONS) as PermissionArea[]).filter((area) => AREA_PERMISSIONS[area].includes(role));
  }

  canAccessOwnedResource(area: PermissionArea, ownerUserId: string): boolean {
    const user = this.authService.getCurrentUser();

    if (!user || !this.canAccess(area, user.role)) {
      return false;
    }

    if (user.role === 'board') {
      return true;
    }

    if (
      area === 'profile' ||
      area === 'notifications' ||
      (user.role === 'foster' &&
        (area === 'animals' || area === 'animal-details' || area === 'costs' || area === 'receipts')) ||
      (user.role === 'driver' && area === 'driver-assignments')
    ) {
      return user.id === ownerUserId;
    }

    return true;
  }
}
