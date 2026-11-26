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
    ['kassierer', 'kassierer', 'Klara', 'Kassierer', 'kassierer@meine-pfote.test'],
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

  it('displays and removes the signed-in user profile photo', () => {
    authService.login('fahrer', 'fahrer');
    expect(authService.updateCurrentUserProfilePhoto('data:image/png;base64,ZmFrZQ==')).toBe(true);

    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();

    const photo = fixture.nativeElement.querySelector('.profile-photo img') as HTMLImageElement;
    expect(photo.src).toContain('data:image/png;base64,ZmFrZQ==');

    fixture.componentInstance.removePhoto();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile-photo img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Profilfoto hochladen');
    fixture.destroy();
  });

  it('rejects unsupported profile photo formats with a clear error', () => {
    authService.login('fahrer', 'fahrer');
    const fixture = TestBed.createComponent(ProfilePage);
    const file = new File(['not an image'], 'document.txt', { type: 'text/plain' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });
    const event = new Event('change');
    Object.defineProperty(event, 'target', { value: input });

    fixture.componentInstance.onPhotoSelected(event);

    expect(fixture.componentInstance.photoError()).toContain('JPG-, PNG- oder WebP-Bild');
    fixture.destroy();
  });
});
