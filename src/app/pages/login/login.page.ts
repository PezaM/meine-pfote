import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonNote } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { lockClosedOutline, pawOutline, personOutline } from 'ionicons/icons';

import { USER_ROLE_LABELS } from '../../models/user';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonButton, IonContent, IonIcon, IonInput, IonItem, IonNote, ReactiveFormsModule, RouterLink],
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly testUsers = this.authService.getTestUsers();
  readonly roleLabels = USER_ROLE_LABELS;
  readonly loginForm = this.formBuilder.nonNullable.group({
    username: ['vorstand', Validators.required],
    password: ['vorstand', Validators.required],
  });
  errorMessage = '';

  constructor() {
    addIcons({ lockClosedOutline, pawOutline, personOutline });
  }

  selectTestUser(username: string, password: string): void {
    this.loginForm.setValue({ username, password });
    this.errorMessage = '';
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.getRawValue();
    const user = this.authService.login(username, password);

    if (!user) {
      this.errorMessage = 'Benutzername oder Passwort ist nicht korrekt.';
      return;
    }

    this.errorMessage = '';
    void this.router.navigateByUrl('/home');
  }
}
