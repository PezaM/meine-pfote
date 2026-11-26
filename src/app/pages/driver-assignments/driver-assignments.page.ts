import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonNote,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmarkCircleOutline, locationOutline, playOutline, timeOutline } from 'ionicons/icons';

import type { DriverAssignment, DriverAssignmentStatus } from '../../models/driver-assignment';
import { DriverAssignmentService } from '../../services/driver-assignment.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-driver-assignments',
  templateUrl: './driver-assignments.page.html',
  styleUrls: ['./driver-assignments.page.scss'],
  imports: [
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonIcon,
    IonNote,
    RouterLink,
  ],
})
export class DriverAssignmentsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly assignmentService = inject(DriverAssignmentService);
  private readonly roleService = inject(RoleService);

  readonly role = this.roleService.getCurrentRole();
  readonly isDetail = this.route.snapshot.data['view'] === 'detail';
  readonly assignmentId = this.route.snapshot.paramMap.get('id');
  private readonly dateFormatter = new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeZone: 'UTC' });
  statusMessage = '';

  constructor() {
    addIcons({ arrowBackOutline, checkmarkCircleOutline, locationOutline, playOutline, timeOutline });
  }

  get assignments(): readonly DriverAssignment[] {
    return this.assignmentService.getAssignmentsForCurrentUser();
  }

  get assignment(): DriverAssignment | null {
    return this.assignmentId ? this.assignmentService.getAssignmentForCurrentUser(this.assignmentId) : null;
  }

  formatDate(date: string): string {
    return this.dateFormatter.format(new Date(`${date}T00:00:00.000Z`));
  }

  statusColor(status: DriverAssignmentStatus): 'warning' | 'primary' | 'success' {
    switch (status) {
      case 'Offen':
        return 'warning';
      case 'In Bearbeitung':
        return 'primary';
      case 'Erledigt':
        return 'success';
    }
  }

  startAssignment(assignment: DriverAssignment): void {
    const updated = this.assignmentService.startAssignment(assignment.id);
    this.statusMessage = updated ? 'Einsatz wurde begonnen.' : 'Der Einsatz kann nicht begonnen werden.';
  }

  completeAssignment(assignment: DriverAssignment): void {
    const updated = this.assignmentService.completeAssignment(assignment.id);
    this.statusMessage = updated
      ? 'Einsatz wurde als erledigt markiert.'
      : 'Nur ein Einsatz in Bearbeitung kann abgeschlossen werden.';
  }
}
