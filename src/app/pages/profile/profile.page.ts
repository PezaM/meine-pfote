import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonNote,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, logOutOutline, pawOutline, peopleOutline } from 'ionicons/icons';

import { USER_ROLE_LABELS } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { FosterHomeService } from '../../services/foster-home.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonIcon, IonNote, RouterLink],
})
export class ProfilePage {
  private static readonly MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
  private static readonly ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  private readonly authService = inject(AuthService);
  private readonly fosterHomeService = inject(FosterHomeService);

  readonly user = this.authService.getCurrentUser();
  readonly roleLabel = this.user ? USER_ROLE_LABELS[this.user.role] : '';
  readonly profilePhoto = signal(this.user?.profilePhoto ?? null);
  readonly photoError = signal('');

  constructor() {
    addIcons({ cameraOutline, logOutOutline, pawOutline, peopleOutline });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.photoError.set('');
    if (!ProfilePage.ALLOWED_PHOTO_TYPES.includes(file.type)) {
      this.photoError.set('Bitte wähle ein JPG-, PNG- oder WebP-Bild aus.');
      input.value = '';
      return;
    }

    if (file.size > ProfilePage.MAX_PHOTO_SIZE_BYTES) {
      this.photoError.set('Das Profilfoto darf höchstens 5 MB groß sein.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        this.photoError.set('Das Profilfoto konnte nicht geladen werden.');
        return;
      }

      if (!this.authService.updateCurrentUserProfilePhoto(reader.result)) {
        this.photoError.set('Das Profilfoto konnte nicht gespeichert werden.');
        return;
      }

      this.profilePhoto.set(reader.result);
    };
    reader.onerror = () => this.photoError.set('Das Profilfoto konnte nicht gelesen werden.');
    reader.readAsDataURL(file);
    input.value = '';
  }

  removePhoto(): void {
    if (this.authService.updateCurrentUserProfilePhoto(null)) {
      this.profilePhoto.set(null);
      this.photoError.set('');
    } else {
      this.photoError.set('Das Profilfoto konnte nicht entfernt werden.');
    }
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
