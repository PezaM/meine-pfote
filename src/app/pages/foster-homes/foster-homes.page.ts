import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonNote,
  IonToggle,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, peopleOutline } from 'ionicons/icons';

import type { Animal } from '../../models/animal';
import type { FosterHomeUpdate } from '../../models/foster-home';
import { AnimalService } from '../../services/animal.service';
import type { FosterHomeDetails } from '../../services/foster-home.service';
import { FosterHomeService } from '../../services/foster-home.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-foster-homes',
  templateUrl: './foster-homes.page.html',
  styleUrls: ['./foster-homes.page.scss'],
  imports: [
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonNote,
    IonToggle,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class FosterHomesPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly fosterHomeService = inject(FosterHomeService);
  private readonly animalService = inject(AnimalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly roleService = inject(RoleService);

  readonly role = this.roleService.getCurrentRole();
  readonly isCreate = this.route.snapshot.data['create'] === true;
  readonly homeId = this.route.snapshot.paramMap.get('id') ?? this.authFosterHomeId();
  readonly isList = !this.isCreate && this.role !== 'foster' && !this.route.snapshot.paramMap.has('id');
  home = this.isCreate || !this.homeId ? null : this.fosterHomeService.getFosterHomeForCurrentUser(this.homeId);
  statusMessage = '';
  private readonly currencyFormatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  readonly homeForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    contactName: ['', Validators.required],
    location: ['', Validators.required],
    address: [''],
    phone: [''],
    email: ['', Validators.email],
    capacity: ['1', Validators.required],
    available: [true],
    status: ['Aktiv'],
  });
  readonly costForm = this.formBuilder.nonNullable.group({
    description: ['', Validators.required],
    amount: ['', Validators.required],
  });

  constructor() {
    addIcons({ addOutline, peopleOutline });
    if (this.home) {
      this.patchHomeForm(this.home);
    }
  }

  get fosterHomes(): readonly FosterHomeDetails[] {
    return this.fosterHomeService.getFosterHomesForCurrentUser();
  }

  get animals(): readonly Animal[] {
    return this.homeId
      ? this.animalService.getAllAnimals().filter((animal) => animal.fosterHomeId === this.homeId)
      : [];
  }

  get canEdit(): boolean {
    return this.role === 'board' || this.role === 'foster';
  }

  saveHome(): void {
    if (this.homeForm.invalid) {
      this.homeForm.markAllAsTouched();
      return;
    }

    const form = this.homeForm.getRawValue();
    if (this.isCreate) {
      const created = this.fosterHomeService.createFosterHome({
        name: form.name.trim(),
        contactName: form.contactName.trim(),
        location: form.location.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        capacity: Number(form.capacity),
      });

      if (!created) {
        this.statusMessage = 'Die Pflegestelle konnte nicht angelegt werden.';
        return;
      }

      void this.router.navigate(['/home/foster-homes', created.id]);
      return;
    }

    if (!this.home || !this.homeId) {
      return;
    }

    const changes: FosterHomeUpdate = {
      name: form.name.trim(),
      contactName: form.contactName.trim(),
      location: form.location.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      capacity: Number(form.capacity),
      available: form.available,
      status: form.status === 'Pausiert' ? 'Pausiert' : 'Aktiv',
    };
    const updated = this.fosterHomeService.updateFosterHome(this.homeId, changes);
    if (!updated) {
      this.statusMessage = 'Die Änderungen konnten nicht gespeichert werden.';
      return;
    }

    this.home = updated;
    this.patchHomeForm(updated);
    this.statusMessage = 'Kontaktdaten wurden gespeichert.';
  }

  assignCost(): void {
    if (!this.home || !this.homeId || this.costForm.invalid) {
      this.costForm.markAllAsTouched();
      return;
    }

    const form = this.costForm.getRawValue();
    const updated = this.fosterHomeService.assignCostToFosterHome(this.homeId, form.description, Number(form.amount));
    if (!updated) {
      this.statusMessage = 'Die Kosten konnten nicht zugeordnet werden. Prüfe Beschreibung und Betrag.';
      return;
    }

    this.home = updated;
    this.costForm.reset({ description: '', amount: '' });
    this.statusMessage = 'Kosten wurden der Pflegestelle zugeordnet.';
  }

  formatCurrency(amount: number): string {
    return this.currencyFormatter.format(amount);
  }

  private authFosterHomeId(): string | null {
    return this.role === 'foster' ? (this.fosterHomeService.getFosterHomesForCurrentUser()[0]?.id ?? null) : null;
  }

  private patchHomeForm(home: FosterHomeDetails): void {
    this.homeForm.patchValue({
      name: home.name,
      contactName: home.contactName,
      location: home.location,
      address: home.address,
      phone: home.phone,
      email: home.email,
      capacity: String(home.capacity),
      available: home.available,
      status: home.status,
    });
  }
}
