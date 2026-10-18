import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MetricsService } from '../../services/metrics.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  private readonly metricsService = inject(MetricsService);
  public readonly stars = signal<number | null>(null);
  public readonly downloads = signal<number | null>(null);

  public constructor() {
    this.metricsService.fetch().subscribe((m) => {
      this.stars.set(m.stars);
      this.downloads.set(m.monthlyDownloads);
    });
  }
}
