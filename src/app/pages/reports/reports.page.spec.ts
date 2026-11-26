import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';

import { ReportsPage } from './reports.page';

describe('ReportsPage', () => {
  let authService: AuthService;
  let permissionService: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
    permissionService = TestBed.inject(PermissionService);
  });

  it('shows monthly totals, category, animal, foster home and admission reports', () => {
    authService.login('kassierer', 'kassierer');
    expect(permissionService.canAccess('reports')).toBe(true);

    const fixture = TestBed.createComponent(ReportsPage);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Monatliche Gesamtausgaben');
    expect(text).toContain('2.184,35');
    expect(text).toContain('Kosten nach Kategorien');
    expect(text).toContain('Kosten nach Tieren');
    expect(text).toContain('Kosten nach Pflegestellen');
    expect(text).toContain('Aufgenommene Tiere');
    expect(text).toContain('18');
    expect(text).toContain('Zeitraum auswählen');
    expect(text).toContain('Bericht exportieren');
    expect(text).toContain('Nicht zugeordnete Kosten anzeigen');
    fixture.destroy();
  });

  it('allows the board and treasurer but denies report access to foster and driver roles', () => {
    authService.login('vorstand', 'vorstand');
    expect(permissionService.canAccess('reports')).toBe(true);

    authService.login('kassierer', 'kassierer');
    expect(permissionService.canAccess('reports')).toBe(true);

    authService.login('pflegestelle', 'pflegestelle');
    expect(permissionService.canAccess('reports')).toBe(false);

    authService.login('fahrer', 'fahrer');
    expect(permissionService.canAccess('reports')).toBe(false);
  });
});
