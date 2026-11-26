import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { DriverAssignmentService } from '../services/driver-assignment.service';
import { PermissionService } from '../services/permission.service';
import { RoleService } from '../services/role.service';

export const driverAssignmentGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const roleService = inject(RoleService);
  const permissionService = inject(PermissionService);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (!permissionService.canAccess('driver-assignments')) {
    return router.createUrlTree([roleService.getDashboardRoute()]);
  }

  const assignmentId = route.paramMap.get('id');
  if (assignmentId && !inject(DriverAssignmentService).getAssignmentForCurrentUser(assignmentId)) {
    return router.createUrlTree(['/home/driver-assignments']);
  }

  return true;
};
