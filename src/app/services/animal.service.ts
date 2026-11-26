import { inject, Injectable, signal } from '@angular/core';

import type { Animal } from '../models/animal';
import type { User } from '../models/user';

import { AuthService } from './auth.service';

const INITIAL_ANIMALS: Animal[] = [
  {
    id: 'animal-luna',
    name: 'Luna',
    species: 'Mischling',
    age: '2 Jahre',
    photoUrl: 'assets/animal-placeholder.svg',
    fosterHomeId: 'sonnenhof',
    status: 'Bereit zur Vermittlung',
    weightKg: 18.4,
    notes: 'Mag ruhige Spaziergänge und kennt die Grundkommandos.',
    healthInformation: 'Guter Allgemeinzustand. Letzte Kontrolle ohne Auffälligkeiten.',
    medicalInformation: 'Impfung am 12. Oktober aufgefrischt. Nächste Kontrolle im Frühjahr.',
    placementStatus: 'Vermittlungsbereit',
    costs: [{ description: 'Kontrolluntersuchung', category: 'Tierarzt', amount: 86.5, date: 'Heute' }],
    receipts: [{ id: 'receipt-luna-1', description: 'Tierarztrechnung', amount: 86.5, date: 'Heute', assigned: true }],
    transport: {
      driverId: 'user-driver',
      pickupLocation: 'Vereinsheim, München',
      destination: 'Tierklinik Isar, München',
      notes: 'Sicherheitsgeschirr verwenden; Wasser für die Rückfahrt mitnehmen.',
    },
  },
  {
    id: 'animal-milo',
    name: 'Milo',
    species: 'Hauskatze',
    age: '8 Monate',
    photoUrl: 'assets/animal-placeholder.svg',
    fosterHomeId: 'sonnenhof',
    status: 'Nachkontrolle geplant',
    weightKg: 3.2,
    notes: 'Neugierig und verspielt; bevorzugt langsame Annäherung.',
    healthInformation: 'Guter Appetit und altersgerechte Entwicklung.',
    medicalInformation: 'Medikamentengabe nach tierärztlicher Anweisung dokumentieren.',
    placementStatus: 'Vermittlungsgespräche laufen',
    costs: [{ description: 'Medikamente', category: 'Medikamente', amount: 42.9, date: 'Gestern' }],
    receipts: [{ id: 'receipt-milo-1', description: 'Apothekenbeleg', amount: 42.9, date: 'Gestern', assigned: false }],
    transport: {
      driverId: 'user-driver',
      pickupLocation: 'Pflegestelle Sonnenhof, München',
      destination: 'Tierklinik Isar, München',
      notes: 'Transportbox mitbringen; ruhig und warm halten.',
    },
  },
  {
    id: 'animal-peppa',
    name: 'Peppa',
    species: 'Kaninchen',
    age: '1 Jahr',
    photoUrl: 'assets/animal-placeholder.svg',
    fosterHomeId: 'pfoten-zuhause',
    status: 'In Pflege',
    weightKg: 1.8,
    notes: 'Innenhaltung mit täglichem Freilauf.',
    healthInformation: 'Aktiv und frisst zuverlässig.',
    medicalInformation: 'Routineuntersuchung beim letzten Termin unauffällig.',
    placementStatus: 'Noch nicht zur Vermittlung freigegeben',
    costs: [{ description: 'Heu und Einstreu', category: 'Futter', amount: 24.5, date: '18. Nov.' }],
    receipts: [{ id: 'receipt-peppa-1', description: 'Futterbeleg', amount: 24.5, date: '18. Nov.', assigned: true }],
    transport: null,
  },
];

export type AnimalUpdate = Partial<
  Pick<Animal, 'name' | 'species' | 'age' | 'fosterHomeId' | 'status' | 'weightKg' | 'photoUrl' | 'notes'>
>;

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private readonly authService = inject(AuthService);
  private readonly animalsState = signal<Animal[]>(INITIAL_ANIMALS);
  private nextAnimalId = 1;

  getAnimalsForCurrentUser(): readonly Animal[] {
    const user = this.authService.getCurrentUser();

    if (!user || user.role === 'driver') {
      return [];
    }

    const animals = this.animalsState();
    return user.role === 'foster' ? animals.filter((animal) => animal.fosterHomeId === user.fosterHomeId) : animals;
  }

  getAllAnimals(): readonly Animal[] {
    return this.animalsState();
  }

  getAnimalForCurrentUser(id: string): Animal | null {
    const user = this.authService.getCurrentUser();
    const animal = this.animalsState().find((candidate) => candidate.id === id);
    return user && animal && this.canViewAnimal(animal, user) ? animal : null;
  }

  canViewAnimal(animal: Animal, user: User): boolean {
    switch (user.role) {
      case 'board':
      case 'treasurer':
        return true;
      case 'foster':
        return Boolean(user.fosterHomeId && animal.fosterHomeId === user.fosterHomeId);
      case 'driver':
        return animal.transport?.driverId === user.id;
    }
  }

  canEditAnimal(animal: Animal): boolean {
    const user = this.authService.getCurrentUser();
    return Boolean(
      user &&
      (user.role === 'board' ||
        (user.role === 'foster' && user.fosterHomeId && animal.fosterHomeId === user.fosterHomeId)),
    );
  }

  createAnimal(details: Pick<Animal, 'name' | 'species' | 'age' | 'fosterHomeId' | 'status'>): Animal | null {
    if (this.authService.getCurrentUser()?.role !== 'board') {
      return null;
    }

    const animal: Animal = {
      ...details,
      id: `animal-${Date.now()}-${this.nextAnimalId++}`,
      photoUrl: 'assets/animal-placeholder.svg',
      weightKg: 0,
      notes: '',
      healthInformation: 'Noch keine Gesundheitsinformationen hinterlegt.',
      medicalInformation: 'Noch keine medizinischen Informationen hinterlegt.',
      placementStatus: 'Noch nicht zur Vermittlung freigegeben',
      costs: [],
      receipts: [],
      transport: null,
    };

    this.animalsState.update((animals) => [...animals, animal]);
    return animal;
  }

  updateAnimal(id: string, changes: AnimalUpdate): Animal | null {
    const animal = this.animalsState().find((candidate) => candidate.id === id);
    if (!animal || !this.canEditAnimal(animal)) {
      return null;
    }

    const user = this.authService.getCurrentUser();
    const allowedChanges: AnimalUpdate =
      user?.role === 'board'
        ? changes
        : {
            weightKg: changes.weightKg,
            photoUrl: changes.photoUrl,
            notes: changes.notes,
          };

    let updatedAnimal: Animal | null = null;
    this.animalsState.update((animals) =>
      animals.map((candidate) => {
        if (candidate.id !== id) {
          return candidate;
        }

        updatedAnimal = { ...candidate, ...allowedChanges };
        return updatedAnimal;
      }),
    );
    return updatedAnimal;
  }

  assignUnassignedReceipts(id: string): boolean {
    const user = this.authService.getCurrentUser();
    if (user?.role !== 'treasurer' && user?.role !== 'board') {
      return false;
    }

    let updated = false;
    this.animalsState.update((animals) =>
      animals.map((animal) => {
        if (animal.id !== id) {
          return animal;
        }

        updated = animal.receipts.some((receipt) => !receipt.assigned);
        return {
          ...animal,
          receipts: animal.receipts.map((receipt) => ({ ...receipt, assigned: true })),
        };
      }),
    );
    return updated;
  }
}
