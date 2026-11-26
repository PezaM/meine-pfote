import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/angular';

import { FOSTER_HOME_NAMES } from '../../models/foster-home';
import { AnimalService } from '../../services/animal.service';
import type { AnimalUpdate } from '../../services/animal.service';
import { FosterHomeService } from '../../services/foster-home.service';
import type { FosterHomeDetails } from '../../services/foster-home.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-animal-detail',
  templateUrl: './animal-detail.page.html',
  styleUrls: ['./animal-detail.page.scss'],
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
    IonNote,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class AnimalDetailPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly animalService = inject(AnimalService);
  private readonly fosterHomeService = inject(FosterHomeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly roleService = inject(RoleService);

  readonly role = this.roleService.getCurrentRole();
  readonly isCreate = this.route.snapshot.data['create'] === true;
  get fosterHomes(): readonly FosterHomeDetails[] {
    return this.fosterHomeService.getFosterHomesForCurrentUser();
  }
  animal = this.isCreate ? null : this.loadAnimal();
  statusMessage = '';
  private readonly currencyFormatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  readonly animalForm = this.formBuilder.nonNullable.group({
    name: [''],
    species: [''],
    age: [''],
    fosterHomeId: [''],
    status: [''],
    weightKg: [''],
    photoUrl: [''],
    notes: [''],
  });

  constructor() {
    if (this.animal) {
      this.animalForm.patchValue({
        name: this.animal.name,
        species: this.animal.species,
        age: this.animal.age,
        fosterHomeId: this.animal.fosterHomeId ?? '',
        status: this.animal.status,
        weightKg: String(this.animal.weightKg),
        photoUrl: this.animal.photoUrl,
        notes: this.animal.notes,
      });
    }
  }

  get canEdit(): boolean {
    return Boolean(this.animal && this.animalService.canEditAnimal(this.animal));
  }

  get canAssignReceipts(): boolean {
    return this.role === 'board' || this.role === 'treasurer';
  }

  get hasUnassignedReceipts(): boolean {
    return Boolean(this.animal?.receipts.some((receipt) => !receipt.assigned));
  }

  fosterHomeName(fosterHomeId: string | null): string {
    const home = fosterHomeId ? this.fosterHomeService.getFosterHomeForCurrentUser(fosterHomeId) : null;
    return (
      home?.name ??
      (fosterHomeId ? (FOSTER_HOME_NAMES[fosterHomeId] ?? 'Unbekannte Pflegestelle') : 'Noch nicht zugewiesen')
    );
  }

  formatCurrency(amount: number): string {
    return this.currencyFormatter.format(amount);
  }

  selectPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.statusMessage = 'Bitte wähle eine Bilddatei aus.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        this.statusMessage = 'Das Foto konnte nicht geladen werden.';
        return;
      }

      this.animalForm.controls.photoUrl.setValue(reader.result);
      this.statusMessage = 'Foto ausgewählt. Speichere die Änderungen, um es zu übernehmen.';
    };
    reader.onerror = () => {
      this.statusMessage = 'Das Foto konnte nicht gelesen werden.';
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    const formValue = this.animalForm.getRawValue();

    if (this.isCreate) {
      const created = this.animalService.createAnimal({
        name: formValue.name.trim(),
        species: formValue.species.trim(),
        age: formValue.age.trim(),
        fosterHomeId: formValue.fosterHomeId || null,
        status: formValue.status.trim(),
      });

      if (!created) {
        this.statusMessage = 'Das Tier konnte nicht angelegt werden.';
        return;
      }

      void this.router.navigate(['/home/animal-details', created.id]);
      return;
    }

    if (!this.animal || !this.canEdit) {
      return;
    }

    const update: AnimalUpdate = {
      weightKg: Number(formValue.weightKg),
      photoUrl: formValue.photoUrl.trim() || 'assets/animal-placeholder.svg',
      notes: formValue.notes.trim(),
    };

    if (this.role === 'board') {
      Object.assign(update, {
        name: formValue.name.trim(),
        species: formValue.species.trim(),
        age: formValue.age.trim(),
        fosterHomeId: formValue.fosterHomeId || null,
        status: formValue.status.trim(),
      });
    }

    const updated = this.animalService.updateAnimal(this.animal.id, update);
    if (!updated) {
      this.statusMessage = 'Die Änderungen konnten nicht gespeichert werden.';
      return;
    }

    this.animal = updated;
    this.statusMessage = 'Änderungen gespeichert.';
  }

  assignReceipts(): void {
    if (!this.animal || !this.animalService.assignUnassignedReceipts(this.animal.id)) {
      this.statusMessage = 'Es gibt keine offenen Belege zum Zuordnen.';
      return;
    }

    this.animal = this.animalService.getAnimalForCurrentUser(this.animal.id);
    this.statusMessage = 'Offene Belege wurden dem Tier zugeordnet.';
  }

  private loadAnimal() {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.animalService.getAnimalForCurrentUser(id) : null;
  }
}
