import { inject, Injectable } from '@angular/core';

import type { User, UserRole } from '../models/user';
import { USER_ROLE_LABELS } from '../models/user';

import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly authService = inject(AuthService);

  getCurrentRole(): UserRole | null {
    return this.authService.getCurrentUser()?.role ?? null;
  }

  hasRole(role: UserRole): boolean {
    return this.getCurrentRole() === role;
  }

  getRoleForUser(user: User | null): UserRole | null {
    return user?.role ?? null;
  }

  getRoleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role];
  }

  isRoleActive(role: UserRole): boolean {
    return this.hasRole(role);
  }

  getDashboardRoute(): string {
    return '/home/dashboard';
  }
}
