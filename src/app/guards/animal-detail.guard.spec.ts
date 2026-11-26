import { TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, Router, UrlTree } from '@angular/router';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../services/auth.service';

import { animalDetailGuard } from './animal-detail.guard';

describe('animalDetailGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('denies a foster direct access to an animal at another foster home', () => {
    authService.login('pflegestelle', 'pflegestelle');

    const result = evaluateGuard('animal-peppa');
    expect(result).not.toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/home/dashboard');
  });

  it('allows a foster to open their own animal and a driver to open an assigned animal', () => {
    authService.login('pflegestelle', 'pflegestelle');
    expect(evaluateGuard('animal-luna')).toBe(true);

    authService.login('fahrer', 'fahrer');
    expect(evaluateGuard('animal-luna')).toBe(true);
    const forbiddenResult = evaluateGuard('animal-peppa');
    expect(forbiddenResult).not.toBe(true);
    expect(router.serializeUrl(forbiddenResult as UrlTree)).toBe('/home/dashboard');
  });

  it('redirects unauthenticated direct access to login', () => {
    const result = evaluateGuard('animal-luna') as UrlTree;
    expect(router.serializeUrl(result)).toBe('/login');
  });

  function evaluateGuard(id: string): boolean | UrlTree {
    const route = { paramMap: convertToParamMap({ id }) } as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => animalDetailGuard(route, {} as RouterStateSnapshot));
    return result instanceof UrlTree ? result : result === true;
  }
});
