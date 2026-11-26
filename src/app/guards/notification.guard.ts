import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { PermissionService } from '../services/permission.service';
import { RoleService } from '../services/role.service';

export const notificationGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const roleService = inject(RoleService);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (!inject(PermissionService).canAccess('notifications')) {
    return router.createUrlTree([roleService.getDashboardRoute()]);
  }

  const notificationId = route.paramMap.get('id');
  if (notificationId && !inject(NotificationService).getNotificationForCurrentUser(notificationId)) {
    return router.createUrlTree(['/home/notifications']);
  }

  return true;
};
