import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { routes } from '../app.routes';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
    service = TestBed.inject(AuthService);
  });

  it('provides the four test users from the central user list', () => {
    expect(service.getUsers().map((user) => user.username)).toEqual([
      'vorstand',
      'pflegestelle',
      'kassierer',
      'fahrer',
    ]);
    expect(service.getUsers().map((user) => user.role)).toEqual(['board', 'foster', 'treasurer', 'driver']);
  });

  it('logs in with each test user and exposes the current user', async () => {
    const credentials = [
      ['vorstand', 'vorstand', 'board'],
      ['pflegestelle', 'pflegestelle', 'foster'],
      ['kassierer', 'kassierer', 'treasurer'],
      ['fahrer', 'fahrer', 'driver'],
    ] as const;

    for (const [username, password, role] of credentials) {
      expect(service.login(username, password)?.role).toBe(role);
      expect(service.getCurrentUser()?.username).toBe(username);
      expect(service.isLoggedIn()).toBe(true);
      await service.logout();
    }
  });

  it('rejects invalid credentials without logging in', () => {
    expect(service.login('vorstand', 'falsch')).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getCurrentUser()).toBeNull();
  });

  it('registers new users in the shared list and accepts their credentials', () => {
    const username = `new-user-${Date.now()}`;
    const registered = service.register({
      firstName: 'Mila',
      lastName: 'Muster',
      email: 'mila@example.org',
      username,
      password: 'geheim',
      role: 'foster',
      fosterHomeId: 'sonnenhof',
    });

    expect(registered).toMatchObject({
      firstName: 'Mila',
      lastName: 'Muster',
      username,
      role: 'foster',
      fosterHomeId: 'sonnenhof',
    });
    expect(service.getUsers()).toContain(registered);
    expect(service.login(username, 'geheim')?.id).toBe(registered?.id);
  });

  it('rejects duplicate usernames case-insensitively', () => {
    expect(service.isUsernameTaken('VORSTAND')).toBe(true);
    expect(
      service.register({
        firstName: 'Mila',
        lastName: 'Muster',
        email: 'mila@example.org',
        username: 'vorstand',
        password: 'geheim',
        role: 'board',
      }),
    ).toBeNull();
  });

  it('clears the current user and navigates to login on logout', async () => {
    const router = TestBed.inject(Router);
    service.login('fahrer', 'fahrer');

    await service.logout();

    expect(service.getCurrentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(router.url).toBe('/login');

    await router.navigateByUrl('/home/dashboard');
    expect(router.url).toBe('/login');
  });
});
