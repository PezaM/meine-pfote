import { inject, Injectable, signal } from '@angular/core';

import type { Animal } from '../models/animal';
import { COST_CATEGORIES } from '../models/cost';
import type { CostDraft, CostEntry, CostStatus } from '../models/cost';

import { AnimalService } from './animal.service';
import { AuthService } from './auth.service';
import { FosterHomeService } from './foster-home.service';

const INITIAL_COSTS: CostEntry[] = [
  {
    id: 'cost-luna-checkup',
    amount: 86.5,
    date: '2026-11-26',
    category: 'Tierarzt',
    description: 'Kontrolluntersuchung Luna',
    animalId: 'animal-luna',
    fosterHomeId: 'sonnenhof',
    receiptName: 'Tierarztrechnung-Luna.pdf',
    receiptAssigned: true,
    status: 'Freigegeben',
  },
  {
    id: 'cost-milo-medication',
    amount: 42.9,
    date: '2026-11-25',
    category: 'Medikamente',
    description: 'Medikamente für Milo',
    animalId: 'animal-milo',
    fosterHomeId: 'sonnenhof',
    receiptName: 'Apothekenbeleg-Milo.jpg',
    receiptAssigned: false,
    status: 'Offen',
  },
  {
    id: 'cost-food',
    amount: 128,
    date: '2026-11-20',
    category: 'Futter',
    description: 'Monatsvorrat Hundefutter',
    animalId: null,
    fosterHomeId: null,
    receiptName: 'Futterbeleg-November.pdf',
    receiptAssigned: true,
    status: 'Freigegeben',
  },
  {
    id: 'cost-transport',
    amount: 34.2,
    date: '2026-11-18',
    category: 'Fahrtkosten',
    description: 'Fahrt zur Tierklinik',
    animalId: 'animal-luna',
    fosterHomeId: 'sonnenhof',
    receiptName: null,
    receiptAssigned: false,
    status: 'Freigegeben',
  },
  {
    id: 'cost-equipment',
    amount: 56.75,
    date: '2026-11-16',
    category: 'Sonstiges',
    description: 'Leinen und Näpfe',
    animalId: null,
    fosterHomeId: null,
    receiptName: 'Kassenbon-Leinen.jpg',
    receiptAssigned: false,
    status: 'Offen',
  },
  {
    id: 'cost-peppa-food',
    amount: 24.5,
    date: '2026-11-18',
    category: 'Futter',
    description: 'Heu und Einstreu für Peppa',
    animalId: 'animal-peppa',
    fosterHomeId: 'pfoten-zuhause',
    receiptName: 'Futterbeleg-Peppa.jpg',
    receiptAssigned: true,
    status: 'Freigegeben',
  },
];

const VALID_STATUSES: readonly CostStatus[] = ['Offen', 'Freigegeben', 'Abgelehnt'];

@Injectable({ providedIn: 'root' })
export class CostService {
  private readonly authService = inject(AuthService);
  private readonly animalService = inject(AnimalService);
  private readonly fosterHomeService = inject(FosterHomeService);
  private readonly costsState = signal<CostEntry[]>(INITIAL_COSTS);
  private nextCostId = 1;

  getCostsForCurrentUser(): readonly CostEntry[] {
    const user = this.authService.getCurrentUser();
    if (!user || user.role === 'driver') {
      return [];
    }

    const costs =
      user.role === 'foster'
        ? this.costsState().filter((cost) => cost.fosterHomeId === user.fosterHomeId)
        : this.costsState();

    return [...costs].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }

  getReceiptsForCurrentUser(): readonly CostEntry[] {
    return this.getCostsForCurrentUser().filter((cost) => cost.receiptName !== null);
  }

  createCost(draft: CostDraft): CostEntry | null {
    const user = this.authService.getCurrentUser();
    if (!user || user.role === 'driver') {
      return null;
    }

    const normalized = this.normalizeDraft(draft);
    if (!normalized) {
      return null;
    }

    const cost: CostEntry = {
      ...normalized,
      id: `cost-${Date.now()}-${this.nextCostId++}`,
      receiptAssigned: false,
      status: 'Offen',
    };
    this.costsState.update((costs) => [...costs, cost]);
    return cost;
  }

  updateCost(id: string, draft: CostDraft): CostEntry | null {
    const user = this.authService.getCurrentUser();
    const existing = this.costsState().find((cost) => cost.id === id);
    if (!user || !existing || (user.role !== 'board' && user.role !== 'treasurer')) {
      return null;
    }

    const normalized = this.normalizeDraft(draft);
    if (!normalized) {
      return null;
    }

    const updated: CostEntry = {
      ...existing,
      ...normalized,
      receiptAssigned: normalized.receiptName === existing.receiptName ? existing.receiptAssigned : false,
    };
    this.costsState.update((costs) => costs.map((cost) => (cost.id === id ? updated : cost)));
    return updated;
  }

  updateStatus(id: string, status: CostStatus): CostEntry | null {
    const user = this.authService.getCurrentUser();
    if (user?.role !== 'board' || !VALID_STATUSES.includes(status)) {
      return null;
    }

    const existing = this.costsState().find((cost) => cost.id === id);
    if (!existing) {
      return null;
    }

    const updated = { ...existing, status };
    this.costsState.update((costs) => costs.map((cost) => (cost.id === id ? updated : cost)));
    return updated;
  }

  setReceiptAssigned(id: string, assigned: boolean): CostEntry | null {
    const user = this.authService.getCurrentUser();
    if ((user?.role !== 'board' && user?.role !== 'treasurer') || typeof assigned !== 'boolean') {
      return null;
    }

    const existing = this.costsState().find((cost) => cost.id === id);
    if (!existing?.receiptName) {
      return null;
    }

    const updated = { ...existing, receiptAssigned: assigned };
    this.costsState.update((costs) => costs.map((cost) => (cost.id === id ? updated : cost)));
    return updated;
  }

  private normalizeDraft(draft: CostDraft): Omit<CostEntry, 'id' | 'receiptAssigned' | 'status'> | null {
    const user = this.authService.getCurrentUser();
    const amount = Number(draft.amount);
    const parsedDate = new Date(`${draft.date}T00:00:00.000Z`);

    if (
      !user ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      Number.isNaN(parsedDate.getTime()) ||
      !COST_CATEGORIES.includes(draft.category) ||
      !draft.description.trim()
    ) {
      return null;
    }

    let animal: Animal | null = null;
    if (draft.animalId) {
      animal = this.animalService.getAnimalForCurrentUser(draft.animalId);
      if (!animal) {
        return null;
      }
    }

    if (user.role === 'foster' && !user.fosterHomeId) {
      return null;
    }

    const fosterHomeId =
      user.role === 'foster' ? (user.fosterHomeId ?? null) : draft.fosterHomeId || animal?.fosterHomeId || null;

    if (
      (animal?.fosterHomeId && animal.fosterHomeId !== fosterHomeId) ||
      (fosterHomeId && !this.fosterHomeService.getFosterHomeForCurrentUser(fosterHomeId))
    ) {
      return null;
    }

    return {
      amount,
      date: draft.date,
      category: draft.category,
      description: draft.description.trim(),
      animalId: animal?.id ?? null,
      fosterHomeId,
      receiptName: draft.receiptName?.trim() || null,
    };
  }
}
