import { TestBed } from '@angular/core/testing';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router, provideRouter, UrlTree } from '@angular/router';

import { routes } from '../app.routes';
import { permissionGuard } from '../guards/permission.guard';
import type { UserRole } from '../models/user';

import { AuthService } from './auth.service';
import type { PermissionArea } from './permission.service';
import { PermissionService } from './permission.service';

const AREAS: readonly PermissionArea[] = [
  'dashboard',
  'animals',
  'animal-details',
  'foster-homes',
  'costs',
  'receipts',
  'reports',
  'notifications',
  'driver-assignments',
  'profile',
];

const EXPECTED_ACCESS: Record<UserRole, readonly PermissionArea[]> = {
  board: AREAS,
  foster: ['dashboard', 'animals', 'animal-details', 'foster-homes', 'costs', 'receipts', 'notifications', 'profile'],
  treasurer: [
    'dashboard',
    'animals',
    'animal-details',
    'foster-homes',
    'costs',
    'receipts',
    'reports',
    'notifications',
    'profile',
  ],
  driver: ['dashboard', 'animal-details', 'notifications', 'driver-assignments', 'profile'],
};

describe('PermissionService', () => {
  let authService: AuthService;
  let permissionService: PermissionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    authService = TestBed.inject(AuthService);
    permissionService = TestBed.inject(PermissionService);
    router = TestBed.inject(Router);
  });

  it('applies the role matrix for every area to all four test users', () => {
    const accounts: [string, string, UserRole][] = [
      ['vorstand', 'vorstand', 'board'],
      ['pflegestelle', 'pflegestelle', 'foster'],
      ['kassierer', 'kassierer', 'treasurer'],
      ['fahrer', 'fahrer', 'driver'],
    ];

    for (const [username, password, role] of accounts) {
      expect(authService.login(username, password)).not.toBeNull();
      expect(permissionService.getAllowedAreas()).toEqual(EXPECTED_ACCESS[role]);

      for (const area of AREAS) {
        expect(permissionService.canAccess(area)).toBe(EXPECTED_ACCESS[role].includes(area));
      }
    }
  });

  it('denies access when there is no authenticated user', () => {
    expect(permissionService.getAllowedAreas()).toEqual([]);
    expect(permissionService.canAccess('dashboard')).toBe(false);
    expect(permissionService.canAccessOwnedResource('animals', 'user-foster')).toBe(false);
  });

  it('limits foster homes and drivers to their own records', () => {
    authService.login('pflegestelle', 'pflegestelle');
    expect(permissionService.canAccessOwnedResource('animals', 'user-foster')).toBe(true);
    expect(permissionService.canAccessOwnedResource('animal-details', 'user-board')).toBe(false);
    expect(permissionService.canAccessOwnedResource('costs', 'user-foster')).toBe(true);
    expect(permissionService.canAccessOwnedResource('receipts', 'user-foster')).toBe(true);
    expect(permissionService.canAccessOwnedResource('receipts', 'user-board')).toBe(false);
    expect(permissionService.canAccessOwnedResource('profile', 'user-board')).toBe(false);
    expect(permissionService.canAccessOwnedResource('notifications', 'user-foster')).toBe(true);
    expect(permissionService.canAccessOwnedResource('notifications', 'user-driver')).toBe(false);

    authService.login('fahrer', 'fahrer');
    expect(permissionService.canAccessOwnedResource('driver-assignments', 'user-driver')).toBe(true);
    expect(permissionService.canAccessOwnedResource('driver-assignments', 'user-foster')).toBe(false);
    expect(permissionService.canAccessOwnedResource('notifications', 'user-driver')).toBe(true);
    expect(permissionService.canAccessOwnedResource('notifications', 'user-foster')).toBe(false);

    authService.login('kassierer', 'kassierer');
    expect(permissionService.canAccessOwnedResource('notifications', 'user-treasurer')).toBe(true);
    expect(permissionService.canAccessOwnedResource('notifications', 'user-driver')).toBe(false);

    authService.login('vorstand', 'vorstand');
    expect(permissionService.canAccessOwnedResource('animals', 'user-foster')).toBe(true);
  });

  it('checks ownership in a guarded direct record route when an owner resolver is provided', async () => {
    authService.login('pflegestelle', 'pflegestelle');

    expect(await evaluateGuard('animal-details', 'user-foster')).toBe(true);
    const forbiddenResult = await evaluateGuard('animal-details', 'user-driver');
    expect(forbiddenResult).not.toBe(true);
    expect(router.serializeUrl(forbiddenResult as UrlTree)).toBe('/home/dashboard');
  });

  it('redirects unauthenticated direct route requests to login', async () => {
    const result = await evaluateGuard('animals');

    expect(result).not.toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('allows authorized routes and redirects forbidden roles to their dashboard', async () => {
    const accounts: [string, string, UserRole][] = [
      ['vorstand', 'vorstand', 'board'],
      ['pflegestelle', 'pflegestelle', 'foster'],
      ['kassierer', 'kassierer', 'treasurer'],
      ['fahrer', 'fahrer', 'driver'],
    ];

    for (const [username, password, role] of accounts) {
      authService.login(username, password);

      for (const area of AREAS) {
        const result = await evaluateGuard(area);

        if (EXPECTED_ACCESS[role].includes(area)) {
          expect(result).toBe(true);
        } else {
          expect(result).not.toBe(true);
          expect(router.serializeUrl(result as UrlTree)).toBe('/home/dashboard');
        }
      }
    }
  });

  async function evaluateGuard(area: PermissionArea, ownerUserId?: string): Promise<boolean | UrlTree> {
    const guard = permissionGuard(area, ownerUserId ? () => ownerUserId : undefined);
    const result = await TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    return result === true ? true : result instanceof UrlTree ? result : false;
  }
});
