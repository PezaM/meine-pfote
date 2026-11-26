import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth.service';

import { AnimalDetailPage } from './animal-detail.page';

describe('AnimalDetailPage role-specific profile visibility', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
              paramMap: convertToParamMap({ id: 'animal-milo' }),
            },
          },
        },
      ],
    });
    authService = TestBed.inject(AuthService);
  });

  function renderProfile(username: string, password: string): ComponentFixture<AnimalDetailPage> {
    expect(authService.login(username, password)).not.toBeNull();
    const fixture = TestBed.createComponent(AnimalDetailPage);
    fixture.detectChanges();
    return fixture;
  }

  it('shows management, placement, medical, and financial details to the board', () => {
    const text = renderProfile('vorstand', 'vorstand').nativeElement.textContent as string;

    expect(text).toContain('Tierprofil bearbeiten');
    expect(text).toContain('Gesundheit & Medizin');
    expect(text).toContain('Vermittlung');
    expect(text).toContain('Kosten & Belege');
    expect(text).toContain('Pflegestelle');
  });

  it('shows own care, medical, and cost details to a foster home', () => {
    const fixture = renderProfile('pflegestelle', 'pflegestelle');
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Eigene Tierdaten aktualisieren');
    expect(fixture.nativeElement.querySelector('ion-input[formcontrolname="weightKg"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('ion-input[formcontrolname="photoUrl"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('ion-textarea[formcontrolname="notes"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('input[type="file"][accept="image/*"]')).not.toBeNull();
    expect(text).toContain('Gesundheit & Medizin');
    expect(text).toContain('Kosten & Belege');
    expect(text).not.toContain('Vermittlung');
  });

  it('shows costs and receipts but no health or medical details to the treasurer', () => {
    const text = renderProfile('kassierer', 'kassierer').nativeElement.textContent as string;

    expect(text).toContain('Kosten & Belege');
    expect(text).toContain('Apothekenbeleg');
    expect(text).toContain('Offene Belege zuordnen');
    expect(text).not.toContain('Gesundheit & Medizin');
    expect(text).not.toContain('Impfung');
  });

  it('shows only name, species, photo, and assigned transport details to the driver', () => {
    const text = renderProfile('fahrer', 'fahrer').nativeElement.textContent as string;

    expect(text).toContain('Milo');
    expect(text).toContain('Hauskatze');
    expect(text).toContain('Transportinformationen');
    expect(text).toContain('Abholort');
    expect(text).toContain('Zielort');
    expect(text).toContain('Transportbox mitbringen');
    expect(text).not.toContain('8 Monate');
    expect(text).not.toContain('Gesundheit & Medizin');
    expect(text).not.toContain('Kosten & Belege');
    expect(text).not.toContain('Apothekenbeleg');
  });
});
