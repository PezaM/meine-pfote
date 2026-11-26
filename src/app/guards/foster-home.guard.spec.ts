import { TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, Router, UrlTree } from '@angular/router';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../services/auth.service';

import { fosterHomeGuard } from './foster-home.guard';

describe('fosterHomeGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('allows a foster to open only their own profile by direct URL', () => {
    authService.login('pflegestelle', 'pflegestelle');

    expect(evaluateGuard('sonnenhof')).toBe(true);
    const result = evaluateGuard('pfoten-zuhause');
    expect(result).not.toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/home/dashboard');
  });

  it('allows the board and treasurer to open any existing foster home', () => {
    for (const [username, password] of [
      ['vorstand', 'vorstand'],
      ['kassierer', 'kassierer'],
    ]) {
      authService.login(username, password);
      expect(evaluateGuard('pfoten-zuhause')).toBe(true);
    }
  });

  it('denies unauthenticated and driver requests', () => {
    const unauthenticated = evaluateGuard('sonnenhof');
    expect(router.serializeUrl(unauthenticated as UrlTree)).toBe('/login');

    authService.login('fahrer', 'fahrer');
    const driverResult = evaluateGuard('sonnenhof');
    expect(router.serializeUrl(driverResult as UrlTree)).toBe('/home/dashboard');
  });

  function evaluateGuard(id: string): boolean | UrlTree {
    const route = { paramMap: convertToParamMap({ id }) } as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => fosterHomeGuard(route, {} as RouterStateSnapshot));
    return result instanceof UrlTree ? result : result === true;
  }
});
