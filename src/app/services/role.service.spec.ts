import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { UserRole } from '../models/user';

import { AuthService } from './auth.service';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let authService: AuthService;
  let service: RoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
    service = TestBed.inject(RoleService);
  });

  it('exposes and checks the active role for each test account', () => {
    const accounts: [string, string, UserRole][] = [
      ['vorstand', 'vorstand', 'board'],
      ['pflegestelle', 'pflegestelle', 'foster'],
      ['kassierer', 'kassierer', 'treasurer'],
      ['fahrer', 'fahrer', 'driver'],
    ];

    for (const [username, password, role] of accounts) {
      const user = authService.login(username, password);

      expect(service.getCurrentRole()).toBe(role);
      expect(service.getRoleForUser(user)).toBe(role);
      expect(service.hasRole(role)).toBe(true);
      expect(service.isRoleActive(role)).toBe(true);
    }
  });

  it('returns no active role when nobody is logged in', () => {
    expect(service.getCurrentRole()).toBeNull();
    expect(service.getRoleForUser(null)).toBeNull();
    expect(service.isRoleActive('board')).toBe(false);
  });

  it('provides the shared localized role labels and dashboard route', () => {
    expect(service.getRoleLabel('treasurer')).toBe('Kassiererin');
    expect(service.getDashboardRoute()).toBe('/home/dashboard');
  });
});
