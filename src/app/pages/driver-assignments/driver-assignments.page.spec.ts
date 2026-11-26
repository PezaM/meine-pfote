import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth.service';

import { DriverAssignmentsPage } from './driver-assignments.page';

describe('DriverAssignmentsPage role-specific views', () => {
  let authService: AuthService;
  let view: 'list' | 'detail';
  let assignmentId: string | null;

  beforeEach(() => {
    view = 'list';
    assignmentId = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            snapshot: {
              get data() {
                return { view };
              },
              get paramMap() {
                return convertToParamMap(assignmentId ? { id: assignmentId } : {});
              },
            },
          }),
        },
      ],
    });
    authService = TestBed.inject(AuthService);
  });

  function render(username: string, password: string): ComponentFixture<DriverAssignmentsPage> {
    expect(authService.login(username, password)).not.toBeNull();
    return TestBed.createComponent(DriverAssignmentsPage);
  }

  it('shows only a driver’s assignments with their details and no administrative information', () => {
    const fixture = render('fahrer', 'fahrer');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Meine Einsätze');
    expect(text).toContain('FA-2026-001');
    expect(text).toContain('Abholung:');
    expect(text).toContain('Ziel:');
    expect(text).toContain('Transportbox mitbringen');
    expect(text).not.toContain('FA-2026-005');
    expect(text).not.toContain('Peppa');
    expect(text).not.toContain('Kosten');
    expect(text).not.toContain('€');
    fixture.destroy();
  });

  it('lets the board view all drivers’ assignments', () => {
    const fixture = render('vorstand', 'vorstand');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Fahrtenverwaltung');
    expect(text).toContain('FA-2026-005');
    expect(text).toContain('Peppa');
    fixture.destroy();
  });

  it('shows status actions on an assignment detail view', () => {
    view = 'detail';
    assignmentId = 'trip-1';
    const fixture = render('fahrer', 'fahrer');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('FA-2026-001');
    expect(text).toContain('Einsatz beginnen');
    expect(text).not.toContain('Kosten');
    fixture.destroy();
  });
});
