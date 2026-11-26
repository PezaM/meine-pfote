import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  calendarOutline,
  cashOutline,
  carOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  locationOutline,
  notificationsOutline,
  pawOutline,
  peopleOutline,
  timeOutline,
  warningOutline,
} from 'ionicons/icons';

import type { Animal } from '../models/animal';
import type { DriverAssignment, DriverAssignmentStatus } from '../models/driver-assignment';
import { USER_ROLE_LABELS, type UserRole } from '../models/user';
import { AnimalService } from '../services/animal.service';
import { AuthService } from '../services/auth.service';
import { DriverAssignmentService } from '../services/driver-assignment.service';
import { RoleService } from '../services/role.service';

interface CostMock {
  description: string;
  category: string;
  amount: number;
  date: string;
}

const RECENT_COSTS: readonly CostMock[] = [
  { description: 'Kontrolluntersuchung Luna', category: 'Tierarzt', amount: 86.5, date: 'Heute' },
  { description: 'Medikamente für Milo', category: 'Medikamente', amount: 42.9, date: 'Gestern' },
  { description: 'Monatsvorrat Hundefutter', category: 'Futter', amount: 128.0, date: '20. Nov.' },
  { description: 'Fahrt zur Tierklinik', category: 'Fahrtkosten', amount: 34.2, date: '18. Nov.' },
  { description: 'Leinen und Näpfe', category: 'Sonstiges', amount: 56.75, date: '16. Nov.' },
];

const CURRENCY = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  imports: [
    IonButton,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    RouterLink,
  ],
})
export class DashboardPage {
  private readonly authService = inject(AuthService);
  private readonly animalService = inject(AnimalService);
  private readonly driverAssignmentService = inject(DriverAssignmentService);
  private readonly roleService = inject(RoleService);

  readonly currentUser = this.authService.getCurrentUser();
  readonly role: UserRole | null = this.roleService.getCurrentRole();
  readonly roleLabel = this.role ? USER_ROLE_LABELS[this.role] : '';

  readonly boardMetrics = [
    { label: 'Aufgenommene Tiere', value: '18', icon: 'paw-outline', color: 'green' },
    { label: 'In Quarantäne', value: '5', icon: 'alert-circle-outline', color: 'amber' },
    { label: 'Ohne Pflegestelle', value: '4', icon: 'people-outline', color: 'coral' },
    { label: 'Offene Kostenfreigaben', value: '3', icon: 'cash-outline', color: 'blue' },
    { label: 'Anstehende Nachkontrollen', value: '2', icon: 'calendar-outline', color: 'violet' },
  ] as const;

  readonly boardTasks = [
    {
      title: 'Kostenfreigabe Tierklinik Isar',
      detail: 'Eingereicht von der Pflegestelle · vor 2 Std.',
      status: 'Offen',
    },
    { title: 'Nachkontrolle bei Familie Weber', detail: 'Luna · morgen um 16:00 Uhr', status: 'Geplant' },
    { title: 'Quarantäneprotokoll prüfen', detail: '5 Tiere · diese Woche', status: 'Ausstehend' },
  ] as const;

  readonly boardNotifications = [
    'Neue Aufnahme: Kater Findus wartet auf Erstuntersuchung.',
    'Pflegestelle Sonnenhof hat einen Tierarzttermin eingetragen.',
    'Zwei Vermittlungsanfragen benötigen eine Rückmeldung.',
  ] as const;

  readonly boardPlacements = [
    { label: 'Interessenten', value: '7', note: 'aktiv im Gespräch' },
    { label: 'Kennenlernen', value: '3', note: 'Termine vereinbaren' },
    { label: 'Vermittlungen diesen Monat', value: '4', note: 'erfolgreich vermittelt' },
  ] as const;

  readonly boardActivities = [
    'Luna hat ihre Nachkontrolle erfolgreich bestanden.',
    'Neue Sachspenden sind im Vereinsheim angekommen.',
    'Das Team hat am Wochenende 240 kg Futter sortiert.',
  ] as const;

  get fosterAnimals(): readonly Animal[] {
    return this.animalService.getAnimalsForCurrentUser();
  }
  readonly fosterAppointments = [
    { date: 'Heute, 15:30', title: 'Impfkontrolle', animal: 'Milo', location: 'Tierarztpraxis am Park' },
    { date: 'Freitag, 10:00', title: 'Routineuntersuchung', animal: 'Luna', location: 'Tierklinik Isar' },
  ] as const;
  readonly fosterReminders = [
    'Milos Medikamente heute Abend geben.',
    'Impfpass zum Termin am Freitag mitbringen.',
    'Aktuelle Fotos für Lunas Vermittlungsprofil aufnehmen.',
  ] as const;
  readonly fosterTasks = [
    { title: 'Wochenbericht für Luna', due: 'Fällig morgen' },
    { title: 'Gewicht von Milo eintragen', due: 'Fällig in 3 Tagen' },
  ] as const;

  readonly treasurerCategories = [
    { name: 'Tierarzt', amount: 5840 },
    { name: 'Medikamente', amount: 2160 },
    { name: 'Futter', amount: 3125 },
    { name: 'Fahrtkosten', amount: 980 },
    { name: 'Sonstiges', amount: 1345 },
  ] as const;
  readonly treasurerRecentCosts = RECENT_COSTS;

  get driverAssignments(): readonly DriverAssignment[] {
    return this.driverAssignmentService.getAssignmentsForCurrentUser();
  }

  get upcomingDriverAssignments(): readonly DriverAssignment[] {
    return this.driverAssignments.filter((assignment) => assignment.status !== 'Erledigt');
  }

  get todayAssignments(): readonly DriverAssignment[] {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
    return this.driverAssignments.filter((assignment) => assignment.date === localDate);
  }

  get driverMetrics(): readonly {
    label: string;
    value: string;
    color: 'green' | 'amber' | 'blue' | 'violet';
  }[] {
    return [
      { label: 'Heutige Fahrten', value: String(this.todayAssignments.length), color: 'green' },
      {
        label: 'Offene Fahrten',
        value: String(this.driverAssignments.filter((trip) => trip.status === 'Offen').length),
        color: 'amber',
      },
      {
        label: 'Laufende Fahrten',
        value: String(this.driverAssignments.filter((trip) => trip.status === 'In Bearbeitung').length),
        color: 'blue',
      },
      {
        label: 'Erledigte Fahrten',
        value: String(this.driverAssignments.filter((trip) => trip.status === 'Erledigt').length),
        color: 'violet',
      },
    ] as const;
  }

  constructor() {
    addIcons({
      alertCircleOutline,
      calendarOutline,
      cashOutline,
      carOutline,
      checkmarkCircleOutline,
      documentTextOutline,
      locationOutline,
      notificationsOutline,
      pawOutline,
      peopleOutline,
      timeOutline,
      warningOutline,
    });
  }

  formatCurrency(amount: number): string {
    return CURRENCY.format(amount);
  }

  formatAssignmentDate(assignment: DriverAssignment): string {
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
    const label =
      assignment.date === today
        ? 'Heute'
        : new Intl.DateTimeFormat('de-DE', { weekday: 'long', timeZone: 'UTC' }).format(
            new Date(`${assignment.date}T00:00:00.000Z`),
          );
    return `${label}, ${assignment.time}`;
  }

  animalStatusColor(status: string): 'success' | 'warning' | 'medium' {
    if (status === 'Bereit zur Vermittlung') {
      return 'success';
    }

    return status === 'Nachkontrolle geplant' ? 'warning' : 'medium';
  }

  get driverStatusColor(): (status: DriverAssignmentStatus) => 'warning' | 'primary' | 'success' {
    return (status) => {
      switch (status) {
        case 'Offen':
          return 'warning';
        case 'In Bearbeitung':
          return 'primary';
        case 'Erledigt':
          return 'success';
      }
    };
  }
}
