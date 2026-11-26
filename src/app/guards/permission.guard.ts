import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import type { PermissionArea } from '../services/permission.service';
import { PermissionService } from '../services/permission.service';
import { RoleService } from '../services/role.service';

export function permissionGuard(
  area: PermissionArea,
  resolveOwnerUserId?: (route: ActivatedRouteSnapshot) => string | null,
): CanActivateFn {
  return (route) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    const permissionService = inject(PermissionService);

    if (!permissionService.canAccess(area)) {
      return router.createUrlTree([inject(RoleService).getDashboardRoute()]);
    }

    if (resolveOwnerUserId && !permissionService.canAccessOwnedResource(area, resolveOwnerUserId(route) ?? '')) {
      return router.createUrlTree([inject(RoleService).getDashboardRoute()]);
    }

    return true;
  };
}
