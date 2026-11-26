import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AnimalService } from './animal.service';
import { AuthService } from './auth.service';

describe('AnimalService', () => {
  let service: AnimalService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    service = TestBed.inject(AnimalService);
    authService = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('shows only animals assigned to the signed-in foster home', () => {
    authService.login('pflegestelle', 'pflegestelle');

    expect(service.getAnimalsForCurrentUser().map((animal) => animal.id)).toEqual(['animal-luna', 'animal-milo']);
    expect(service.getAnimalForCurrentUser('animal-peppa')).toBeNull();
    expect(service.getAnimalForCurrentUser('animal-luna')).not.toBeNull();
  });

  it('allows the board and treasurer to view all animal profiles', () => {
    authService.login('vorstand', 'vorstand');
    expect(service.getAnimalsForCurrentUser()).toHaveLength(3);

    authService.login('kassierer', 'kassierer');
    expect(service.getAnimalsForCurrentUser()).toHaveLength(3);
    expect(service.getAnimalForCurrentUser('animal-peppa')).not.toBeNull();
  });

  it('limits drivers to assigned transport profiles and hides the animal list', () => {
    authService.login('fahrer', 'fahrer');

    expect(service.getAnimalsForCurrentUser()).toEqual([]);
    expect(service.getAnimalForCurrentUser('animal-luna')).not.toBeNull();
    expect(service.getAnimalForCurrentUser('animal-peppa')).toBeNull();
    expect(service.canEditAnimal(service.getAnimalForCurrentUser('animal-luna')!)).toBe(false);
  });

  it('allows a foster to update only their own care fields', () => {
    authService.login('pflegestelle', 'pflegestelle');

    const updated = service.updateAnimal('animal-luna', {
      weightKg: 19,
      notes: 'Neue Notiz',
      status: 'Unberechtigt geändert',
    });

    expect(updated?.weightKg).toBe(19);
    expect(updated?.notes).toBe('Neue Notiz');
    expect(updated?.status).toBe('Bereit zur Vermittlung');
    expect(service.updateAnimal('animal-peppa', { weightKg: 2 })).toBeNull();
  });

  it('allows only the board to create animals and treasurer to assign receipts', () => {
    authService.login('pflegestelle', 'pflegestelle');
    expect(
      service.createAnimal({
        name: 'Fips',
        species: 'Hund',
        age: '1 Jahr',
        fosterHomeId: null,
        status: 'In Pflege',
      }),
    ).toBeNull();

    authService.login('vorstand', 'vorstand');
    expect(
      service.createAnimal({
        name: 'Fips',
        species: 'Hund',
        age: '1 Jahr',
        fosterHomeId: null,
        status: 'In Pflege',
      }),
    ).not.toBeNull();

    authService.login('kassierer', 'kassierer');
    expect(service.assignUnassignedReceipts('animal-milo')).toBe(true);
    expect(service.getAnimalForCurrentUser('animal-milo')?.receipts.every((receipt) => receipt.assigned)).toBe(true);
  });
});
