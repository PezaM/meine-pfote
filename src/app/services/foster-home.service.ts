import { inject, Injectable, signal } from '@angular/core';

import type { FosterHome, FosterHomeUpdate } from '../models/foster-home';
import { INITIAL_FOSTER_HOMES } from '../models/foster-home';

import { AnimalService } from './animal.service';
import { AuthService } from './auth.service';

export type FosterHomeDetails = Omit<FosterHome, 'costs'> & {
  animalCount: number;
  costs: FosterHome['costs'];
};

@Injectable({ providedIn: 'root' })
export class FosterHomeService {
  private readonly authService = inject(AuthService);
  private readonly animalService = inject(AnimalService);
  private readonly homesState = signal<FosterHome[]>(INITIAL_FOSTER_HOMES);
  private nextHomeId = 1;
  private nextCostId = 1;

  getFosterHomesForCurrentUser(): readonly FosterHomeDetails[] {
    const user = this.authService.getCurrentUser();
    if (!user || user.role === 'driver') {
      return [];
    }

    const homes = this.homesState();
    const visibleHomes = user.role === 'foster' ? homes.filter((home) => home.id === user.fosterHomeId) : homes;
    return visibleHomes.map((home) => this.withAnimalCount(home));
  }

  getFosterHomeForCurrentUser(id: string): FosterHomeDetails | null {
    const user = this.authService.getCurrentUser();
    const home = this.homesState().find((candidate) => candidate.id === id);
    if (!user || !home || (user.role === 'foster' && home.id !== user.fosterHomeId)) {
      return null;
    }

    if (user.role === 'driver') {
      return null;
    }

    return this.withAnimalCount(home);
  }

  createFosterHome(
    details: Pick<FosterHome, 'name' | 'contactName' | 'location' | 'address' | 'phone' | 'email' | 'capacity'>,
  ): FosterHome | null {
    if (this.authService.getCurrentUser()?.role !== 'board') {
      return null;
    }

    const home: FosterHome = {
      ...details,
      id: `foster-home-${Date.now()}-${this.nextHomeId++}`,
      available: true,
      status: 'Aktiv',
      costs: [],
    };
    this.homesState.update((homes) => [...homes, home]);
    return home;
  }

  updateFosterHome(id: string, changes: FosterHomeUpdate): FosterHomeDetails | null {
    const user = this.authService.getCurrentUser();
    const home = this.homesState().find((candidate) => candidate.id === id);
    if (!user || !home || (user.role !== 'board' && !(user.role === 'foster' && user.fosterHomeId === id))) {
      return null;
    }

    const allowedChanges: FosterHomeUpdate =
      user.role === 'board'
        ? changes
        : {
            contactName: changes.contactName,
            location: changes.location,
            address: changes.address,
            phone: changes.phone,
            email: changes.email,
          };

    let updatedHome: FosterHome | null = null;
    this.homesState.update((homes) =>
      homes.map((candidate) => {
        if (candidate.id !== id) {
          return candidate;
        }

        updatedHome = { ...candidate, ...allowedChanges };
        return updatedHome;
      }),
    );
    return updatedHome ? this.withAnimalCount(updatedHome) : null;
  }

  assignCostToFosterHome(id: string, description: string, amount: number): FosterHomeDetails | null {
    const role = this.authService.getCurrentUser()?.role;
    const home = this.homesState().find((candidate) => candidate.id === id);
    if (
      (role !== 'treasurer' && role !== 'board') ||
      !home ||
      !description.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return null;
    }

    let updatedHome: FosterHome | null = null;
    this.homesState.update((homes) =>
      homes.map((candidate) => {
        if (candidate.id !== id) {
          return candidate;
        }

        updatedHome = {
          ...candidate,
          costs: [
            ...candidate.costs,
            {
              id: `home-cost-${Date.now()}-${this.nextCostId++}`,
              description: description.trim(),
              amount,
              date: new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(new Date()),
            },
          ],
        };
        return updatedHome;
      }),
    );
    return updatedHome ? this.withAnimalCount(updatedHome) : null;
  }

  private withAnimalCount(home: FosterHome): FosterHomeDetails {
    const animalCount = this.animalService.getAllAnimals().filter((animal) => animal.fosterHomeId === home.id).length;
    return { ...home, animalCount };
  }
}
