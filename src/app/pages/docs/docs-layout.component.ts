import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DOC_SECTIONS } from '../../docs-sections';

@Component({
  selector: 'app-docs-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive, TranslatePipe],
  template: `
    <div class="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside class="hidden w-56 flex-shrink-0 sm:block">
        <nav class="sticky top-20 flex flex-col gap-1 text-sm">
          @for (section of sections; track section.slug) {
            <a
              [routerLink]="['/', lang, 'docs', section.slug]"
              routerLinkActive="text-cyan font-semibold"
              class="rounded px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-cyan"
            >
              {{ section.titleKey | translate }}
            </a>
          }
        </nav>
      </aside>
      <div class="min-w-0 flex-1"><router-outlet /></div>
    </div>
  `,
})
export class DocsLayoutComponent {
  private readonly translate = inject(TranslateService);
  public readonly sections = DOC_SECTIONS;

  public get lang(): string {
    return this.translate.getCurrentLang() || 'en';
  }
}
