import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { FosterHomeService } from './foster-home.service';

describe('FosterHomeService', () => {
  let authService: AuthService;
  let service: FosterHomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
    service = TestBed.inject(FosterHomeService);
  });

  it('lets the board view, create, and edit foster homes', () => {
    authService.login('vorstand', 'vorstand');

    expect(service.getFosterHomesForCurrentUser()).toHaveLength(4);
    const home = service.createFosterHome({
      name: 'Neue Pflegestelle',
      contactName: 'Alex Beispiel',
      location: 'Linz',
      address: 'Beispielstraße 1',
      phone: '0123',
      email: 'alex@example.test',
      capacity: 2,
    });
    expect(home?.name).toBe('Neue Pflegestelle');
    expect(service.updateFosterHome(home!.id, { capacity: 3 })?.capacity).toBe(3);
  });

  it('limits a foster user to their own profile and editable contact fields', () => {
    authService.login('pflegestelle', 'pflegestelle');

    expect(service.getFosterHomesForCurrentUser().map((home) => home.id)).toEqual(['sonnenhof']);
    expect(service.getFosterHomeForCurrentUser('pfoten-zuhause')).toBeNull();
    expect(
      service.updateFosterHome('pfoten-zuhause', {
        phone: 'unauthorized',
      }),
    ).toBeNull();

    const updated = service.updateFosterHome('sonnenhof', {
      phone: '+43 700 000',
      capacity: 20,
      available: false,
      status: 'Pausiert',
    });
    expect(updated?.phone).toBe('+43 700 000');
    expect(updated?.capacity).toBe(3);
    expect(updated?.available).toBe(true);
    expect(updated?.status).toBe('Aktiv');
  });

  it('lets the treasurer review all homes and assign costs but not edit contact data', () => {
    authService.login('kassierer', 'kassierer');

    expect(service.getFosterHomesForCurrentUser()).toHaveLength(4);
    expect(service.updateFosterHome('sonnenhof', { phone: 'unauthorized' })).toBeNull();
    const updated = service.assignCostToFosterHome('sonnenhof', 'Futter', 45);
    expect(updated?.costs.at(-1)?.description).toBe('Futter');
  });

  it('denies foster-home management and cost allocation to drivers', () => {
    authService.login('fahrer', 'fahrer');

    expect(service.getFosterHomesForCurrentUser()).toEqual([]);
    expect(service.getFosterHomeForCurrentUser('sonnenhof')).toBeNull();
    expect(service.assignCostToFosterHome('sonnenhof', 'Futter', 45)).toBeNull();
  });
});
