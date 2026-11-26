import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { FosterHomeService } from '../services/foster-home.service';

export const fosterHomeGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const id = route.paramMap.get('id');
  if (id && inject(FosterHomeService).getFosterHomeForCurrentUser(id)) {
    return true;
  }

  return router.createUrlTree(['/home/dashboard']);
};
