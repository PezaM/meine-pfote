import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AuthService } from '../../services/auth.service';

import { CostsPage } from './costs.page';

describe('CostsPage role-specific views', () => {
  let authService: AuthService;
  let routeData: BehaviorSubject<{ area: 'costs' | 'receipts' }>;

  beforeEach(() => {
    routeData = new BehaviorSubject<{ area: 'costs' | 'receipts' }>({ area: 'costs' });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            data: routeData.asObservable(),
            snapshot: {
              get data() {
                return routeData.value;
              },
            },
          }),
        },
      ],
    });
    authService = TestBed.inject(AuthService);
  });

  function render(username: string, password: string): ComponentFixture<CostsPage> {
    expect(authService.login(username, password)).not.toBeNull();
    return TestBed.createComponent(CostsPage);
  }

  it('lets the board view, edit, and approve costs across foster homes', () => {
    const fixture = render('vorstand', 'vorstand');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Alle Kosten');
    expect(text).toContain('Kontrolluntersuchung Luna');
    expect(text).toContain('Heu und Einstreu für Peppa');
    expect(text).toContain('Bearbeiten');
    expect(text).toContain('Freigeben');
    fixture.destroy();
  });

  it('lets the treasurer manage all costs and view receipt assignment controls', () => {
    routeData.next({ area: 'receipts' });
    const fixture = render('kassierer', 'kassierer');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Belegübersicht');
    expect(text).toContain('Futterbeleg-Peppa.jpg');
    expect(text).toContain('Beleg zuordnen');
    fixture.destroy();
  });

  it('limits a foster user to their own costs and receipts', () => {
    const fixture = render('pflegestelle', 'pflegestelle');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Kosten meiner Pflegestelle');
    expect(text).toContain('Kontrolluntersuchung Luna');
    expect(text).not.toContain('Monatsvorrat Hundefutter');
    expect(text).not.toContain('Heu und Einstreu für Peppa');
    expect(text).not.toContain('Bearbeiten');
    fixture.destroy();

    routeData.next({ area: 'receipts' });
    const receiptFixture = render('pflegestelle', 'pflegestelle');
    receiptFixture.detectChanges();
    const receiptText = receiptFixture.nativeElement.textContent as string;

    expect(receiptText).toContain('Apothekenbeleg-Milo.jpg');
    expect(receiptText).not.toContain('Futterbeleg-Peppa.jpg');
    expect(receiptText).not.toContain('Beleg zuordnen');
    receiptFixture.destroy();
  });

  it('shows no costs or receipts to the driver', () => {
    const fixture = render('fahrer', 'fahrer');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Es wurden noch keine Kosten erfasst.');
    expect(text).not.toContain('Kontrolluntersuchung Luna');
    expect(text).not.toContain('86,50');
    fixture.destroy();
  });
});
