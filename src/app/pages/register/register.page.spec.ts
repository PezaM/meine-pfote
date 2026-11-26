import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { routes } from '../../app.routes';
import { AuthService } from '../../services/auth.service';

import { RegisterPage } from './register.page';

describe('RegisterPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideRouter(routes),
        {
          provide: ToastController,
          useValue: { create: async () => ({ present: async () => undefined }) },
        },
      ],
    }).compileComponents();
  });

  it('validates required fields, email, and matching passwords', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    const form = fixture.componentInstance.registrationForm;

    expect(form.invalid).toBe(true);

    form.patchValue({
      firstName: 'Mila',
      lastName: 'Muster',
      email: 'keine-mail',
      username: `required-${Date.now()}`,
      password: 'eins',
      repeatedPassword: 'zwei',
      role: 'board',
    });

    expect(form.controls.email.hasError('email')).toBe(true);
    expect(form.hasError('passwordMismatch')).toBe(true);
  });

  it('requires a foster home only for the foster-home role', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    const component = fixture.componentInstance;
    const form = component.registrationForm;

    form.patchValue({
      firstName: 'Mila',
      lastName: 'Muster',
      email: 'mila@example.org',
      username: `foster-${Date.now()}`,
      password: 'geheim',
      repeatedPassword: 'geheim',
      role: 'foster',
    });

    expect(component.isFosterHomeRequired).toBe(true);
    expect(form.hasError('fosterHomeRequired')).toBe(true);

    form.controls.fosterHomeId.setValue('sonnenhof');
    expect(form.valid).toBe(true);
  });

  it('navigates between login and registration routes', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/login');
    expect(router.url).toBe('/login');

    await router.navigateByUrl('/register');
    expect(router.url).toBe('/register');
  });

  it('creates a registered user and returns to login', async () => {
    const fixture = TestBed.createComponent(RegisterPage);
    const component = fixture.componentInstance;
    component.registrationForm.patchValue({
      firstName: 'Mila',
      lastName: 'Muster',
      email: 'mila@example.org',
      username: `registered-${Date.now()}`,
      password: 'geheim',
      repeatedPassword: 'geheim',
      role: 'foster',
      fosterHomeId: 'sonnenhof',
    });

    await component.submitRegistration();

    const authService = TestBed.inject(AuthService);
    expect(authService.getUsers().some((user) => user.username.startsWith('registered-'))).toBe(true);
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
