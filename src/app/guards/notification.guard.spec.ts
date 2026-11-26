import { TestBed } from '@angular/core/testing';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router, provideRouter, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';

import { notificationGuard } from './notification.guard';

describe('notificationGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('allows a user to open their own notification and redirects when opening another role’s notice', () => {
    authService.login('pflegestelle', 'pflegestelle');
    expect(awaitGuard('notice-foster-vet')).toBe(true);

    const forbidden = awaitGuard('notice-treasurer-receipt');
    expect(forbidden).not.toBe(true);
    expect(router.serializeUrl(forbidden as UrlTree)).toBe('/home/notifications');
  });

  it('allows the board to open organization-wide notices and denies roles without notification access', () => {
    authService.login('vorstand', 'vorstand');
    expect(awaitGuard('notice-driver-other-trip')).toBe(true);

    authService.login('kassierer', 'kassierer');
    expect(awaitGuard('notice-treasurer-receipt')).toBe(true);

    authService.login('fahrer', 'fahrer');
    const forbidden = awaitGuard('notice-driver-other-trip');
    expect(forbidden).not.toBe(true);
    expect(router.serializeUrl(forbidden as UrlTree)).toBe('/home/notifications');
  });

  function awaitGuard(id: string): boolean | UrlTree {
    const result = TestBed.runInInjectionContext(() =>
      notificationGuard(
        {
          paramMap: { get: (name: string) => (name === 'id' ? id : null) },
        } as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );

    return result === true ? true : result instanceof UrlTree ? result : false;
  }
});
