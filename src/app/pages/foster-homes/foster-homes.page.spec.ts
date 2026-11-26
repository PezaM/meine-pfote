import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth.service';

import { FosterHomesPage } from './foster-homes.page';

describe('FosterHomesPage role-specific views', () => {
  let authService: AuthService;
  let routeId: string | null;
  let createRoute: boolean;

  beforeEach(() => {
    routeId = null;
    createRoute = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            snapshot: {
              data: { create: createRoute },
              paramMap: convertToParamMap(routeId ? { id: routeId } : {}),
            },
          }),
        },
      ],
    });
    authService = TestBed.inject(AuthService);
  });

  function render(username: string, password: string): ComponentFixture<FosterHomesPage> {
    expect(authService.login(username, password)).not.toBeNull();
    return TestBed.createComponent(FosterHomesPage);
  }

  it('shows all foster homes and creation controls to the board', () => {
    const fixture = render('vorstand', 'vorstand');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Pflegestellen');
    expect(text).toContain('Pflegestelle anlegen');
    expect(text).toContain('Pflegestelle Sonnenhof');
    expect(text).toContain('Pfoten-Zuhause Müller');
    expect(text).toContain('Katzenhilfe am Park');
    expect(text).toContain('Hof Hoffnung');
    fixture.destroy();
  });

  it('lets the treasurer review all homes without board-only creation controls', () => {
    const fixture = render('kassierer', 'kassierer');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Pflegestelle Sonnenhof');
    expect(text).toContain('Hof Hoffnung');
    expect(text).not.toContain('Pflegestelle anlegen');
    fixture.destroy();
  });

  it('shows the foster user only their own profile and contact fields', () => {
    const fixture = render('pflegestelle', 'pflegestelle');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('MEIN PROFIL');
    expect(text).toContain('Pflegestelle Sonnenhof');
    expect(text).toContain('Kontaktdaten');
    expect(text).toContain('Belegung');
    expect(text).not.toContain('Pfoten-Zuhause Müller');
    expect(text).not.toContain('Katzenhilfe am Park');
    expect(text).not.toContain('Kosten dieser Pflegestelle');
    fixture.destroy();
  });

  it('shows no foster home data to the driver', () => {
    const fixture = render('fahrer', 'fahrer');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).not.toContain('Pflegestelle Sonnenhof');
    expect(text).not.toContain('Kontaktdaten');
    fixture.destroy();
  });
});
