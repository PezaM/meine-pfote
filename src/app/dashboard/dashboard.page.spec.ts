import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../services/auth.service';

import { DashboardPage } from './dashboard.page';

describe('DashboardPage role dashboards', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
  });

  function renderDashboard(username: string, password: string): string {
    expect(authService.login(username, password)).not.toBeNull();
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    fixture.destroy();
    return text;
  }

  it('shows the board metrics, tasks, notifications, placement overview, and activities', () => {
    const text = renderDashboard('vorstand', 'vorstand');

    expect(text).toContain('18');
    expect(text).toContain('5');
    expect(text).toContain('4');
    expect(text).toContain('Offene Kostenfreigaben');
    expect(text).toContain('Anstehende Nachkontrollen');
    expect(text).toContain('Aktuelle Aufgaben');
    expect(text).toContain('Neue Benachrichtigungen');
    expect(text).toContain('Vermittlungsübersicht');
    expect(text).toContain('Aktuelle Vereinsaktivitäten');
  });

  it('shows only animals assigned to the signed-in foster home', () => {
    const text = renderDashboard('pflegestelle', 'pflegestelle');

    expect(text).toContain('Eigene Tiere');
    expect(text).toContain('2');
    expect(text).toContain('Luna');
    expect(text).toContain('Milo');
    expect(text).not.toContain('Peppa');
    expect(text).toContain('Anstehende Tierarzttermine');
    expect(text).toContain('Erinnerungen');
    expect(text).toContain('Offene Aufgaben');
  });

  it('shows financial totals, all requested cost categories, and recent costs to the treasurer', () => {
    const text = renderDashboard('kassierer', 'kassierer');

    expect(text).toContain('Gesamtausgaben');
    expect(text).toContain('13.450,00');
    expect(text).toContain('Ausgaben im November');
    expect(text).toContain('Offene Kostenfreigaben');
    expect(text).toContain('Nicht zugeordnete Belege');
    expect(text).toContain('Tierarzt');
    expect(text).toContain('Medikamente');
    expect(text).toContain('Futter');
    expect(text).toContain('Fahrtkosten');
    expect(text).toContain('Sonstiges');
    expect(text).toContain('Zuletzt erfasste Kosten');
  });

  it('shows the driver’s own trips and no financial or administrative data', () => {
    const text = renderDashboard('fahrer', 'fahrer');

    expect(text).toContain('Heutige Fahrten');
    expect(text).toContain('Offene Fahrten');
    expect(text).toContain('Laufende Fahrten');
    expect(text).toContain('Erledigte Fahrten');
    expect(text).toContain('Abholung:');
    expect(text).toContain('Ziel:');
    expect(text).toContain('Heute, 14:30');
    expect(text).toContain('Milo');
    expect(text).toContain('Transportbox mitbringen');
    expect(text).not.toContain('Peppa');
    expect(text).not.toContain('Gesamtausgaben');
    expect(text).not.toContain('Kostenfreigaben');
    expect(text).not.toContain('Nicht zugeordnete Belege');
    expect(text).not.toContain('€');
    expect(text).not.toContain('Sonstiges');
  });
});
