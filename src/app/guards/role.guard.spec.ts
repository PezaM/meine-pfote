import { TestBed } from '@angular/core/testing';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router, UrlTree, provideRouter } from '@angular/router';

import { routes } from '../app.routes';
import { AuthService } from '../services/auth.service';

import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('only allows the board role to open the More route', () => {
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const guard = roleGuard(['board']);

    for (const [username, password] of [
      ['vorstand', 'vorstand'],
      ['pflegestelle', 'pflegestelle'],
      ['kassierer', 'kassierer'],
      ['fahrer', 'fahrer'],
    ]) {
      authService.login(username, password);
      const result = TestBed.runInInjectionContext(() =>
        guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      );

      if (username === 'vorstand') {
        expect(result).toBe(true);
      } else {
        expect(result).toBeInstanceOf(UrlTree);
        expect(router.serializeUrl(result as UrlTree)).toBe('/home/dashboard');
      }
    }
  });

  it('redirects unauthenticated users to login', () => {
    const router = TestBed.inject(Router);
    const guard = roleGuard(['board']);
    const result = TestBed.runInInjectionContext(() => guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
