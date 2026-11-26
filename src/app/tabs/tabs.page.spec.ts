import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from '../app.routes';
import type { UserRole } from '../models/user';
import { AuthService } from '../services/auth.service';

import { TabsPage } from './tabs.page';

describe('TabsPage', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    authService = TestBed.inject(AuthService);
  });

  it('shows only the specified tabs for each role', () => {
    const accounts: [string, string, UserRole, string[]][] = [
      ['vorstand', 'vorstand', 'board', ['Dashboard', 'Tiere', 'Pflegestellen', 'Kosten', 'Mehr']],
      ['pflegestelle', 'pflegestelle', 'foster', ['Dashboard', 'Meine Tiere', 'Benachrichtigungen', 'Profil']],
      ['kassierer', 'kassierer', 'treasurer', ['Dashboard', 'Kosten', 'Belege', 'Berichte', 'Pflegestellen']],
      ['fahrer', 'fahrer', 'driver', ['Dashboard', 'Meine Einsätze', 'Profil']],
    ];

    for (const [username, password, role, expectedTabs] of accounts) {
      expect(authService.login(username, password)?.role).toBe(role);

      const fixture = TestBed.createComponent(TabsPage);
      expect(fixture.componentInstance.navigation.map((item) => item.label)).toEqual(expectedTabs);
      fixture.destroy();
    }
  });
});
