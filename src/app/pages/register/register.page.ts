import { Component, inject } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonNote,
  IonSelect,
  IonSelectOption,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { pawOutline } from 'ionicons/icons';

import { INITIAL_FOSTER_HOMES } from '../../models/foster-home';
import { USER_ROLE_LABELS } from '../../models/user';
import type { UserRole } from '../../models/user';
import { AuthService } from '../../services/auth.service';

const USER_ROLES = Object.entries(USER_ROLE_LABELS).map(([value, label]) => ({
  value: value as UserRole,
  label,
}));

function isUserRole(value: string): value is UserRole {
  return Object.hasOwn(USER_ROLE_LABELS, value);
}

function registrationValidator(control: AbstractControl): ValidationErrors | null {
  const errors: ValidationErrors = {};
  const password = control.get('password')?.value;
  const repeatedPassword = control.get('repeatedPassword')?.value;
  const role = control.get('role')?.value;
  const fosterHomeId = control.get('fosterHomeId')?.value;

  if (
    typeof password === 'string' &&
    typeof repeatedPassword === 'string' &&
    password.length > 0 &&
    repeatedPassword.length > 0 &&
    password !== repeatedPassword
  ) {
    errors['passwordMismatch'] = true;
  }

  if (role === 'foster' && !fosterHomeId) {
    errors['fosterHomeRequired'] = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonNote,
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  readonly roles = USER_ROLES;
  readonly fosterHomes = INITIAL_FOSTER_HOMES;
  readonly registrationForm = this.formBuilder.nonNullable.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: [
        '',
        [
          Validators.required,
          (control) => (this.authService.isUsernameTaken(String(control.value)) ? { usernameTaken: true } : null),
        ],
      ],
      password: ['', Validators.required],
      repeatedPassword: ['', Validators.required],
      role: this.formBuilder.nonNullable.control<UserRole | ''>('', Validators.required),
      fosterHomeId: [''],
    },
    { validators: registrationValidator },
  );
  submitted = false;
  errorMessage = '';

  constructor() {
    addIcons({ pawOutline });
  }

  get isFosterHomeRequired(): boolean {
    return this.registrationForm.controls.role.value === 'foster';
  }

  async submitRegistration(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const formValue = this.registrationForm.getRawValue();
    const role = formValue.role;
    if (!isUserRole(role)) {
      this.errorMessage = 'Bitte wähle eine gültige Benutzerrolle aus.';
      return;
    }

    const registeredUser = this.authService.register({
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      username: formValue.username,
      password: formValue.password,
      role,
      ...(role === 'foster' ? { fosterHomeId: formValue.fosterHomeId } : {}),
    });

    if (!registeredUser) {
      this.registrationForm.controls.username.setErrors({ usernameTaken: true });
      this.errorMessage = 'Dieser Benutzername ist bereits vergeben. Bitte wähle einen anderen.';
      return;
    }

    const toast = await this.toastController.create({
      message: 'Registrierung erfolgreich. Du kannst dich jetzt anmelden.',
      color: 'success',
      duration: 2500,
      position: 'top',
    });
    await toast.present();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
