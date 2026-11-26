import { TestBed } from '@angular/core/testing';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router, provideRouter, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';

import { driverAssignmentGuard } from './driver-assignment.guard';

describe('driverAssignmentGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('allows drivers to open their own assignments and redirects other drivers to the list', () => {
    authService.login('fahrer', 'fahrer');

    expect(awaitGuard('trip-1')).toBe(true);

    const forbidden = awaitGuard('trip-5');
    expect(forbidden).not.toBe(true);
    expect(router.serializeUrl(forbidden as UrlTree)).toBe('/home/driver-assignments');
  });

  it('allows the board to open any assignment and redirects other roles', () => {
    authService.login('vorstand', 'vorstand');
    expect(awaitGuard('trip-5')).toBe(true);

    authService.login('kassierer', 'kassierer');
    const forbidden = awaitGuard('trip-1');
    expect(forbidden).not.toBe(true);
    expect(router.serializeUrl(forbidden as UrlTree)).toBe('/home/dashboard');
  });

  function awaitGuard(id: string): boolean | UrlTree {
    const result = TestBed.runInInjectionContext(() =>
      driverAssignmentGuard(
        {
          paramMap: { get: (name: string) => (name === 'id' ? id : null) },
        } as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );

    return result === true ? true : result instanceof UrlTree ? result : false;
  }
});
