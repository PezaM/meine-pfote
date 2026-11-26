import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import type { UserRole } from '../models/user';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRoles: readonly UserRole[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const user = authService.getCurrentUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    return allowedRoles.includes(user.role) || router.createUrlTree(['/home/dashboard']);
  };
}
