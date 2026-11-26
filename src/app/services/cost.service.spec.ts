import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { CostDraft } from '../models/cost';

import { AuthService } from './auth.service';
import { CostService } from './cost.service';

const COST_DRAFT: CostDraft = {
  amount: 19.95,
  date: '2026-11-26',
  category: 'Futter',
  description: 'Spezialfutter für Luna',
  animalId: 'animal-luna',
  fosterHomeId: 'sonnenhof',
  receiptName: 'Futterbeleg.pdf',
};

describe('CostService', () => {
  let authService: AuthService;
  let service: CostService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
    service = TestBed.inject(CostService);
  });

  it('shows all costs to board and treasurer, only own foster-home costs to fosters, and none to drivers', () => {
    authService.login('vorstand', 'vorstand');
    expect(service.getCostsForCurrentUser()).toHaveLength(6);

    authService.login('kassierer', 'kassierer');
    expect(service.getCostsForCurrentUser()).toHaveLength(6);

    authService.login('pflegestelle', 'pflegestelle');
    const fosterCosts = service.getCostsForCurrentUser();
    expect(fosterCosts.length).toBeGreaterThan(0);
    expect(fosterCosts.every((cost) => cost.fosterHomeId === 'sonnenhof')).toBe(true);
    expect(fosterCosts.some((cost) => cost.animalId === 'animal-peppa')).toBe(false);
    expect(service.getReceiptsForCurrentUser().every((cost) => cost.fosterHomeId === 'sonnenhof')).toBe(true);

    authService.login('fahrer', 'fahrer');
    expect(service.getCostsForCurrentUser()).toEqual([]);
    expect(service.getReceiptsForCurrentUser()).toEqual([]);
    expect(service.createCost(COST_DRAFT)).toBeNull();
  });

  it('lets a foster create costs and receipts only for their own foster home and animals', () => {
    authService.login('pflegestelle', 'pflegestelle');
    const created = service.createCost({ ...COST_DRAFT, fosterHomeId: 'pfoten-zuhause' });

    expect(created?.fosterHomeId).toBe('sonnenhof');
    expect(created?.animalId).toBe('animal-luna');
    expect(created?.receiptName).toBe('Futterbeleg.pdf');
    expect(created?.receiptAssigned).toBe(false);
    expect(created?.status).toBe('Offen');
    expect(service.createCost({ ...COST_DRAFT, animalId: 'animal-peppa' })).toBeNull();
    expect(service.updateCost('cost-luna-checkup', COST_DRAFT)).toBeNull();
    expect(service.updateStatus('cost-milo-medication', 'Freigegeben')).toBeNull();
    expect(service.setReceiptAssigned('cost-milo-medication', true)).toBeNull();
  });

  it('lets the board edit costs and manage approval status', () => {
    authService.login('vorstand', 'vorstand');
    const updated = service.updateCost('cost-luna-checkup', {
      ...COST_DRAFT,
      description: 'Aktualisierte Untersuchung',
    });

    expect(updated?.description).toBe('Aktualisierte Untersuchung');
    expect(service.updateStatus('cost-milo-medication', 'Freigegeben')?.status).toBe('Freigegeben');
  });

  it('lets the treasurer edit costs and assign existing receipts, but not approve costs', () => {
    authService.login('kassierer', 'kassierer');
    expect(service.updateCost('cost-luna-checkup', COST_DRAFT)).not.toBeNull();
    expect(service.setReceiptAssigned('cost-milo-medication', true)?.receiptAssigned).toBe(true);
    expect(service.updateStatus('cost-milo-medication', 'Freigegeben')).toBeNull();
  });
});
