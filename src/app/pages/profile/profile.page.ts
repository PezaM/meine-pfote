import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline, peopleOutline } from 'ionicons/icons';

import { USER_ROLE_LABELS } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { FosterHomeService } from '../../services/foster-home.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, RouterLink],
})
export class ProfilePage {
  private readonly authService = inject(AuthService);
  private readonly fosterHomeService = inject(FosterHomeService);

  readonly user = this.authService.getCurrentUser();
  readonly roleLabel = this.user ? USER_ROLE_LABELS[this.user.role] : '';

  constructor() {
    addIcons({ logOutOutline, peopleOutline });
  }

  get fosterHomeName(): string | null {
    if (!this.user?.fosterHomeId) {
      return null;
    }

    return this.fosterHomeService.getFosterHomeForCurrentUser(this.user.fosterHomeId)?.name ?? null;
  }

  logout(): void {
    void this.authService.logout();
  }
}
