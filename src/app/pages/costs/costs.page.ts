import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonInput,
  IonItem,
  IonIcon,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, calendarOutline, eyeOutline, funnelOutline, searchOutline } from 'ionicons/icons';
import { map } from 'rxjs';

import type { Animal } from '../../models/animal';
import { COST_CATEGORIES } from '../../models/cost';
import type { CostDraft, CostEntry, CostStatus } from '../../models/cost';
import { AnimalService } from '../../services/animal.service';
import { AuthService } from '../../services/auth.service';
import { CostService } from '../../services/cost.service';
import type { FosterHomeDetails } from '../../services/foster-home.service';
import { FosterHomeService } from '../../services/foster-home.service';
import { RoleService } from '../../services/role.service';

function todayAsIsoDate(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-costs',
  templateUrl: './costs.page.html',
  styleUrls: ['./costs.page.scss'],
  imports: [
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonInput,
    IonItem,
    IonIcon,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class CostsPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly animalService = inject(AnimalService);
  private readonly fosterHomeService = inject(FosterHomeService);
  private readonly costService = inject(CostService);
  private readonly routeArea = toSignal(
    this.route.data.pipe(map((data) => (data['area'] === 'receipts' ? 'receipts' : 'costs'))),
    { initialValue: this.route.snapshot.data['area'] === 'receipts' ? 'receipts' : 'costs' },
  );

  readonly isReceiptView = computed(() => this.routeArea() === 'receipts');
  readonly title = computed(() => (this.isReceiptView() ? 'Belegübersicht' : 'Kostenverwaltung'));
  readonly categories = COST_CATEGORIES;
  readonly role = this.roleService.getCurrentRole();
  readonly currentUser = this.authService.getCurrentUser();
  readonly canCreate = this.role === 'board' || this.role === 'foster' || this.role === 'treasurer';
  readonly canManageCosts = this.role === 'board' || this.role === 'treasurer';
  readonly canApproveCosts = this.role === 'board';
  readonly canAssignReceipts = this.canManageCosts;
  readonly costForm = this.formBuilder.nonNullable.group({
    amount: ['', [Validators.required, Validators.min(0.01)]],
    date: [todayAsIsoDate(), Validators.required],
    category: ['Tierarzt', Validators.required],
    description: ['', Validators.required],
    animalId: [''],
    fosterHomeId: [''],
    receiptName: [''],
  });
  statusMessage = '';
  editingCostId: string | null = null;
  private readonly currencyFormatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  private readonly dateFormatter = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeZone: 'UTC' });

  constructor() {
    addIcons({ addOutline, calendarOutline, eyeOutline, funnelOutline, searchOutline });
  }

  get animals(): readonly Animal[] {
    return this.animalService.getAnimalsForCurrentUser();
  }

  get fosterHomes(): readonly FosterHomeDetails[] {
    return this.fosterHomeService.getFosterHomesForCurrentUser();
  }

  get costs(): readonly CostEntry[] {
    return this.costService.getCostsForCurrentUser();
  }

  get receipts(): readonly CostEntry[] {
    return this.costService.getReceiptsForCurrentUser();
  }

  get fosterHomeFieldValue(): string {
    return this.role === 'foster' ? (this.currentUser?.fosterHomeId ?? '') : this.costForm.controls.fosterHomeId.value;
  }

  formatCurrency(amount: number): string {
    return this.currencyFormatter.format(amount);
  }

  formatDate(date: string): string {
    return this.dateFormatter.format(new Date(`${date}T00:00:00.000Z`));
  }

  animalName(animalId: string | null): string {
    return this.animals.find((animal) => animal.id === animalId)?.name ?? 'Kein Tier zugeordnet';
  }

  fosterHomeName(fosterHomeId: string | null): string {
    if (!fosterHomeId) {
      return 'Keine Pflegestelle zugeordnet';
    }

    return this.fosterHomeService.getFosterHomeForCurrentUser(fosterHomeId)?.name ?? 'Unbekannte Pflegestelle';
  }

  selectAnimal(): void {
    const animalId = this.costForm.controls.animalId.value;
    const animal = this.animals.find((candidate) => candidate.id === animalId);
    if (animal && this.role !== 'foster') {
      this.costForm.controls.fosterHomeId.setValue(animal.fosterHomeId ?? '');
    }
  }

  selectReceipt(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      this.statusMessage = 'Bitte wähle eine PDF- oder Bilddatei als Beleg aus.';
      return;
    }

    this.costForm.controls.receiptName.setValue(file.name);
    this.statusMessage = 'Beleg ausgewählt. Der Dateiname wird in der Mock-Verwaltung gespeichert.';
  }

  submitCost(): void {
    if (this.costForm.invalid) {
      this.costForm.markAllAsTouched();
      this.statusMessage = 'Bitte fülle alle Pflichtfelder korrekt aus.';
      return;
    }

    const draft = this.createDraft();
    if (!draft) {
      this.statusMessage = 'Bitte wähle eine gültige Kostenkategorie aus.';
      return;
    }

    const saved = this.editingCostId
      ? this.costService.updateCost(this.editingCostId, draft)
      : this.costService.createCost(draft);

    if (!saved) {
      this.statusMessage = 'Die Kosten konnten nicht gespeichert werden. Prüfe Tier und Pflegestelle.';
      return;
    }

    this.resetForm();
    this.statusMessage = this.editingCostId ? 'Kosten wurden aktualisiert.' : 'Kosten wurden erfasst.';
    this.editingCostId = null;
  }

  editCost(cost: CostEntry): void {
    if (!this.canManageCosts) {
      return;
    }

    this.editingCostId = cost.id;
    this.statusMessage = '';
    this.costForm.setValue({
      amount: String(cost.amount),
      date: cost.date,
      category: cost.category,
      description: cost.description,
      animalId: cost.animalId ?? '',
      fosterHomeId: cost.fosterHomeId ?? '',
      receiptName: cost.receiptName ?? '',
    });
  }

  cancelEdit(): void {
    this.editingCostId = null;
    this.resetForm();
    this.statusMessage = '';
  }

  updateStatus(costId: string, status: CostStatus): void {
    if (!this.costService.updateStatus(costId, status)) {
      this.statusMessage = 'Der Freigabestatus konnte nicht geändert werden.';
      return;
    }

    this.statusMessage = `Kosten wurden als „${status}“ markiert.`;
  }

  toggleReceiptAssignment(cost: CostEntry): void {
    if (!this.costService.setReceiptAssigned(cost.id, !cost.receiptAssigned)) {
      this.statusMessage = 'Die Belegzuordnung konnte nicht geändert werden.';
      return;
    }

    this.statusMessage = cost.receiptAssigned ? 'Belegzuordnung aufgehoben.' : 'Beleg wurde zugeordnet.';
  }

  costStatusColor(status: CostStatus): 'warning' | 'success' | 'danger' {
    switch (status) {
      case 'Offen':
        return 'warning';
      case 'Freigegeben':
        return 'success';
      case 'Abgelehnt':
        return 'danger';
    }
  }

  private createDraft(): CostDraft | null {
    const form = this.costForm.getRawValue();
    const category = this.categories.find((value) => value === form.category);
    if (!category) {
      return null;
    }

    return {
      amount: Number(form.amount),
      date: form.date,
      category,
      description: form.description,
      animalId: form.animalId || null,
      fosterHomeId: this.role === 'foster' ? (this.currentUser?.fosterHomeId ?? null) : form.fosterHomeId || null,
      receiptName: form.receiptName || null,
    };
  }

  private resetForm(): void {
    this.costForm.reset({
      amount: '',
      date: todayAsIsoDate(),
      category: 'Tierarzt',
      description: '',
      animalId: '',
      fosterHomeId: '',
      receiptName: '',
    });
  }
}
