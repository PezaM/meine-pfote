import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth.service';

import { ProfilePage } from './profile.page';

describe('ProfilePage', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
  });

  it.each([
    ['vorstand', 'vorstand', 'Anna', 'Vorstand', 'vorstand@meine-pfote.test'],
    ['pflegestelle', 'pflegestelle', 'Mila', 'Pflegestelle', 'pflegestelle@meine-pfote.test'],
    ['kassierer', 'kassierer', 'Klara', 'Kassiererin', 'kassiererin@meine-pfote.test'],
    ['fahrer', 'fahrer', 'David', 'Fahrer', 'fahrer@meine-pfote.test'],
  ])('shows the signed-in user profile for %s', (username, password, firstName, role, email) => {
    expect(authService.login(username, password)).not.toBeNull();
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain(firstName);
    expect(text).toContain(username);
    expect(text).toContain(email);
    expect(text).toContain(role);
    expect(text).toContain('Abmelden');
    fixture.destroy();
  });

  it('shows a foster home association and preserves access to foster contact editing', () => {
    authService.login('pflegestelle', 'pflegestelle');
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Pflegestelle Sonnenhof');
    expect(text).toContain('Pflegestellen-Kontaktdaten bearbeiten');
    fixture.destroy();
  });
});
