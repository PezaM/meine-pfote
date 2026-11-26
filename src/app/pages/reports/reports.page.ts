import { Component } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, calendarOutline, downloadOutline } from 'ionicons/icons';

interface ReportRow {
  label: string;
  amount: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  imports: [
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
    IonSelect,
    IonSelectOption,
  ],
})
export class ReportsPage {
  readonly month = 'November 2026';
  readonly totalMonthlyExpenses = 2184.35;
  readonly admittedAnimalCount = 18;
  readonly categories: readonly ReportRow[] = [
    { label: 'Tierarzt', amount: 842.5 },
    { label: 'Medikamente', amount: 316.85 },
    { label: 'Futter', amount: 590 },
    { label: 'Fahrtkosten', amount: 285 },
    { label: 'Sonstiges', amount: 150 },
  ];
  readonly animals: readonly ReportRow[] = [
    { label: 'Luna', amount: 436.5 },
    { label: 'Milo', amount: 287.9 },
    { label: 'Peppa', amount: 124.5 },
    { label: 'Nicht zugeordnet', amount: 1335.45 },
  ];
  readonly fosterHomes: readonly ReportRow[] = [
    { label: 'Pflegestelle Sonnenhof', amount: 724.4 },
    { label: 'Pfoten-Zuhause Müller', amount: 224.5 },
    { label: 'Weitere / nicht zugeordnet', amount: 1235.45 },
  ];
  private readonly currencyFormatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

  constructor() {
    addIcons({ alertCircleOutline, calendarOutline, downloadOutline });
  }

  formatCurrency(amount: number): string {
    return this.currencyFormatter.format(amount);
  }
}
