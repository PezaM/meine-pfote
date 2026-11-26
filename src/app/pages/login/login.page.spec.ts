import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { routes } from '../../app.routes';
import { AuthService } from '../../services/auth.service';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('prefills the first test user', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    expect(fixture.componentInstance.loginForm.getRawValue()).toEqual({
      username: 'vorstand',
      password: 'vorstand',
    });
  });

  it('copies the selected test user credentials into the form', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    fixture.componentInstance.selectTestUser('fahrer', 'fahrer');

    expect(fixture.componentInstance.loginForm.getRawValue()).toEqual({
      username: 'fahrer',
      password: 'fahrer',
    });
  });

  it('authenticates through AuthService and navigates to the protected page', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance;

    component.loginForm.setValue({ username: 'vorstand', password: 'vorstand' });
    component.submitLogin();
    await TestBed.inject(Router).navigateByUrl('/home/dashboard');

    expect(TestBed.inject(AuthService).getCurrentUser()?.role).toBe('board');
    expect(TestBed.inject(Router).url).toBe('/home/dashboard');
  });
});
