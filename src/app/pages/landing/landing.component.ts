import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MetricsService } from '../../services/metrics.service';
import { CURRENT_DOCUMENTATION_VERSION } from '../../docs-versions';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  private readonly metricsService = inject(MetricsService);
  private readonly translate = inject(TranslateService);
  public readonly stars = signal<number | null>(null);
  public readonly downloads = signal<number | null>(null);
  public readonly documentationVersion = CURRENT_DOCUMENTATION_VERSION;

  public get lang(): string {
    return this.translate.getCurrentLang() || 'en';
  }

  public featureRoute(feature: string): readonly string[] {
    return feature === 'nestjs'
      ? ['/', this.lang, 'docs', this.documentationVersion, 'nestjs', 'introduction']
      : ['/', this.lang, 'docs', this.documentationVersion, feature === 'validators' ? 'validators' : 'introduction'];
  }

  public constructor() {
    this.metricsService.fetch().subscribe((m) => {
      this.stars.set(m.stars);
      this.downloads.set(m.monthlyDownloads);
    });
  }
}
