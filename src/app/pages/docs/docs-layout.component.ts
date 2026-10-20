import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DOC_SECTIONS } from '../../docs-sections';
import { CURRENT_DOCUMENTATION_VERSION, DOCUMENTATION_VERSIONS } from '../../docs-versions';

@Component({
  selector: 'app-docs-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive, TranslatePipe],
  template: `
    <div class="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row">
      <details class="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:hidden">
        <summary class="cursor-pointer font-semibold text-slate-200">{{ 'docs.nav.menu' | translate }}</summary>
        <nav class="mt-3 flex flex-col gap-1 border-t border-white/10 pt-3 text-sm">
          <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500" for="mobile-documentation-version">{{ 'docs.nav.version' | translate }}</label>
          <select id="mobile-documentation-version" class="mb-3 rounded border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-cyan focus:outline-none" [value]="version" (change)="setVersion($any($event.target).value)">
            @for (item of versions; track item.value) {<option [value]="item.value">{{ item.label }}{{ item.isLatest ? ' · latest' : '' }}</option>}
          </select>
          @for (section of sections; track section.slug) {
            <a [routerLink]="['/', lang, 'docs', version, section.slug]" routerLinkActive="bg-cyan/10 text-cyan font-semibold" class="rounded px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-cyan">{{ section.titleKey | translate }}</a>
          }
        </nav>
      </details>
      <aside class="hidden w-56 flex-shrink-0 sm:block">
        <nav class="sticky top-20 flex flex-col gap-1 text-sm">
          <label class="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500" for="documentation-version">{{ 'docs.nav.version' | translate }}</label>
          <select id="documentation-version" class="mb-4 rounded border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-cyan focus:outline-none" [value]="version" (change)="setVersion($any($event.target).value)">
            @for (item of versions; track item.value) {<option [value]="item.value">{{ item.label }}{{ item.isLatest ? ' · latest' : '' }}</option>}
          </select>
          @for (section of sections; track section.slug) {
            <a
              [routerLink]="['/', lang, 'docs', version, section.slug]"
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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  public readonly sections = DOC_SECTIONS;
  public readonly versions = DOCUMENTATION_VERSIONS;

  public get lang(): string {
    return this.translate.getCurrentLang() || 'en';
  }

  public get version(): string {
    return this.route.firstChild?.snapshot.paramMap.get('version') ?? CURRENT_DOCUMENTATION_VERSION;
  }

  public setVersion(version: string): void {
    const slug = this.route.firstChild?.snapshot.paramMap.get('slug') ?? 'introduction';
    this.router.navigate(['/', this.lang, 'docs', version, slug]);
  }
}
