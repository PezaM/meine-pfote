import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { AnimalService } from '../services/animal.service';
import { AuthService } from '../services/auth.service';

export const animalDetailGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const animalId = route.paramMap.get('id');
  if (animalId && inject(AnimalService).getAnimalForCurrentUser(animalId)) {
    return true;
  }

  return router.createUrlTree(['/home/dashboard']);
};
