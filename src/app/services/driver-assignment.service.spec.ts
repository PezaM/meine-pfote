import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { DriverAssignmentService } from './driver-assignment.service';

describe('DriverAssignmentService', () => {
  let authService: AuthService;
  let service: DriverAssignmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    authService = TestBed.inject(AuthService);
    service = TestBed.inject(DriverAssignmentService);
  });

  it('limits drivers to their own assignments and enforces valid status transitions', () => {
    authService.login('fahrer', 'fahrer');
    const assignments = service.getAssignmentsForCurrentUser();

    expect(assignments).toHaveLength(4);
    expect(assignments.every((assignment) => assignment.driverId === 'user-driver')).toBe(true);
    expect(assignments.some((assignment) => assignment.animalName === 'Peppa')).toBe(false);
    expect(service.getAssignmentForCurrentUser('trip-5')).toBeNull();
    expect(service.startAssignment('trip-5')).toBeNull();
    expect(service.completeAssignment('trip-1')).toBeNull();
    expect(service.startAssignment('trip-1')?.status).toBe('In Bearbeitung');
    expect(service.completeAssignment('trip-1')?.status).toBe('Erledigt');
    expect(service.completeAssignment('trip-1')).toBeNull();
  });

  it('allows the board to view and manage all drivers’ assignments', () => {
    authService.login('vorstand', 'vorstand');

    expect(service.getAssignmentsForCurrentUser()).toHaveLength(5);
    expect(service.getAssignmentForCurrentUser('trip-5')?.animalName).toBe('Peppa');
    expect(service.startAssignment('trip-5')?.status).toBe('In Bearbeitung');
    expect(service.completeAssignment('trip-5')?.status).toBe('Erledigt');
  });

  it('denies assignment visibility and status changes to other roles', () => {
    authService.login('pflegestelle', 'pflegestelle');
    expect(service.getAssignmentsForCurrentUser()).toEqual([]);
    expect(service.startAssignment('trip-1')).toBeNull();

    authService.login('kassierer', 'kassierer');
    expect(service.getAssignmentsForCurrentUser()).toEqual([]);
    expect(service.completeAssignment('trip-3')).toBeNull();
  });
});
