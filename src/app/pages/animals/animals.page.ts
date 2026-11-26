import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonBadge, IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonNote } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, pawOutline } from 'ionicons/icons';

import type { Animal } from '../../models/animal';
import { FOSTER_HOME_NAMES } from '../../models/foster-home';
import { AnimalService } from '../../services/animal.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-animals',
  templateUrl: './animals.page.html',
  styleUrls: ['./animals.page.scss'],
  imports: [IonBadge, IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonNote, RouterLink],
})
export class AnimalsPage {
  private readonly animalService = inject(AnimalService);
  private readonly roleService = inject(RoleService);

  get animals(): readonly Animal[] {
    return this.animalService.getAnimalsForCurrentUser();
  }
  readonly role = this.roleService.getCurrentRole();
  readonly fosterHomes = FOSTER_HOME_NAMES;

  constructor() {
    addIcons({ addOutline, pawOutline });
  }
}
