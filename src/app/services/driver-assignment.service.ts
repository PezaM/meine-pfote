import { inject, Injectable, signal } from '@angular/core';

import type { DriverAssignment, DriverAssignmentStatus } from '../models/driver-assignment';

import { AuthService } from './auth.service';

function localDate(date: Date): string {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 10);
}

function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDate(date);
}

const INITIAL_ASSIGNMENTS: DriverAssignment[] = [
  {
    id: 'trip-1',
    assignmentNumber: 'FA-2026-001',
    driverId: 'user-driver',
    animalId: 'animal-milo',
    animalName: 'Milo',
    animalSpecies: 'Katze',
    date: dateOffset(0),
    time: '14:30',
    pickupLocation: 'Pflegestelle Sonnenhof, Linz',
    destination: 'Tierklinik Isar, Linz',
    transportNotes: 'Transportbox mitbringen; ruhig und warm halten.',
    status: 'Offen',
  },
  {
    id: 'trip-2',
    assignmentNumber: 'FA-2026-002',
    driverId: 'user-driver',
    animalId: 'animal-milo',
    animalName: 'Milo',
    animalSpecies: 'Katze',
    date: dateOffset(0),
    time: '16:00',
    pickupLocation: 'Tierklinik Isar, Linz',
    destination: 'Pflegestelle Sonnenhof, Linz',
    transportNotes: 'Nach der Untersuchung direkt zurückfahren.',
    status: 'Offen',
  },
  {
    id: 'trip-3',
    assignmentNumber: 'FA-2026-003',
    driverId: 'user-driver',
    animalId: 'animal-luna',
    animalName: 'Luna',
    animalSpecies: 'Mischling',
    date: dateOffset(0),
    time: '13:15',
    pickupLocation: 'Vereinsheim, Linz',
    destination: 'Tierklinik Isar, Linz',
    transportNotes: 'Sicherheitsgeschirr verwenden; Wasser für die Rückfahrt mitnehmen.',
    status: 'In Bearbeitung',
  },
  {
    id: 'trip-4',
    assignmentNumber: 'FA-2026-004',
    driverId: 'user-driver',
    animalId: 'animal-luna',
    animalName: 'Luna',
    animalSpecies: 'Mischling',
    date: dateOffset(-1),
    time: '11:15',
    pickupLocation: 'Tierarztpraxis West',
    destination: 'Vereinsheim, Linz',
    transportNotes: 'Transportbox wurde zurückgegeben.',
    status: 'Erledigt',
  },
  {
    id: 'trip-5',
    assignmentNumber: 'FA-2026-005',
    driverId: 'user-driver-other',
    animalId: 'animal-peppa',
    animalName: 'Peppa',
    animalSpecies: 'Kaninchen',
    date: dateOffset(1),
    time: '09:00',
    pickupLocation: 'Pflegestelle Pfoten-Zuhause, Hagenberg',
    destination: 'Tierarztpraxis West',
    transportNotes: 'Kaninchenbox verwenden und vor Zugluft schützen.',
    status: 'Offen',
  },
];

@Injectable({ providedIn: 'root' })
export class DriverAssignmentService {
  private readonly authService = inject(AuthService);
  private readonly assignmentsState = signal<DriverAssignment[]>(INITIAL_ASSIGNMENTS);

  getAssignmentsForCurrentUser(): readonly DriverAssignment[] {
    const user = this.authService.getCurrentUser();
    if (!user || (user.role !== 'board' && user.role !== 'driver')) {
      return [];
    }

    return this.assignmentsState()
      .filter((assignment) => user.role === 'board' || assignment.driverId === user.id)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }

  getAssignmentForCurrentUser(id: string): DriverAssignment | null {
    return this.getAssignmentsForCurrentUser().find((assignment) => assignment.id === id) ?? null;
  }

  startAssignment(id: string): DriverAssignment | null {
    return this.updateStatus(id, 'In Bearbeitung', 'Offen');
  }

  completeAssignment(id: string): DriverAssignment | null {
    return this.updateStatus(id, 'Erledigt', 'In Bearbeitung');
  }

  private updateStatus(
    id: string,
    status: DriverAssignmentStatus,
    requiredStatus: DriverAssignmentStatus,
  ): DriverAssignment | null {
    const assignment = this.getAssignmentForCurrentUser(id);
    if (!assignment || assignment.status !== requiredStatus) {
      return null;
    }

    const updated = { ...assignment, status };
    this.assignmentsState.update((assignments) =>
      assignments.map((current) => (current.id === id ? updated : current)),
    );
    return updated;
  }
}
