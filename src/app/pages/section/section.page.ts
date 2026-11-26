import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { map } from 'rxjs';

@Component({
  selector: 'app-section',
  templateUrl: './section.page.html',
  styleUrls: ['./section.page.scss'],
  imports: [IonContent],
})
export class SectionPage {
  private readonly route = inject(ActivatedRoute);
  readonly title = toSignal(
    this.route.data.pipe(map((data) => (typeof data['title'] === 'string' ? data['title'] : 'Bereich'))),
    { initialValue: 'Bereich' },
  );
}
