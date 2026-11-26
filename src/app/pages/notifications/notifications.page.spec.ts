import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth.service';

import { NotificationsPage } from './notifications.page';

describe('NotificationsPage role-specific views', () => {
  let authService: AuthService;
  let notificationId: string | null;

  beforeEach(() => {
    notificationId = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            snapshot: {
              paramMap: convertToParamMap(notificationId ? { id: notificationId } : {}),
            },
          }),
        },
      ],
    });
    authService = TestBed.inject(AuthService);
  });

  function render(username: string, password: string): ComponentFixture<NotificationsPage> {
    expect(authService.login(username, password)).not.toBeNull();
    return TestBed.createComponent(NotificationsPage);
  }

  it('shows all organization notices to the board', () => {
    const fixture = render('vorstand', 'vorstand');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Neue Tieraufnahme');
    expect(text).toContain('Neuer Beleg wartet auf Zuordnung');
    expect(text).toContain('Fahrt FA-2026-005');
    expect(text).toContain('ungelesen');
    fixture.destroy();
  });

  it('shows fosters only their animal and task notifications', () => {
    const fixture = render('pflegestelle', 'pflegestelle');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Tierarzttermin für Milo');
    expect(text).toContain('Wochenbericht für Luna');
    expect(text).not.toContain('Neuer Beleg wartet');
    expect(text).not.toContain('Fahrt FA-2026');
    fixture.destroy();
  });

  it('shows the treasurer only financial notifications', () => {
    const fixture = render('kassierer', 'kassierer');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Neuer Beleg wartet auf Zuordnung');
    expect(text).toContain('Kostenfreigabe erforderlich');
    expect(text).not.toContain('Tierarzttermin für Milo');
    expect(text).not.toContain('Fahrt FA-2026');
    fixture.destroy();
  });

  it('shows the driver only notices about their own trips', () => {
    const fixture = render('fahrer', 'fahrer');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Fahrt FA-2026-001 steht an');
    expect(text).not.toContain('Fahrt FA-2026-005');
    expect(text).not.toContain('Apothekenbeleg');
    fixture.destroy();
  });

  it('opens a notification and offers a read action without exposing unrelated data', () => {
    notificationId = 'notice-driver-trip-1';
    const fixture = render('fahrer', 'fahrer');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Fahrt FA-2026-001 steht an');
    expect(text).toContain('Als gelesen markieren');
    expect(text).not.toContain('Kosten');
    fixture.destroy();
  });
});
