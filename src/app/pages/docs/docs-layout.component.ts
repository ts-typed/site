import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DOC_SECTIONS } from '../../docs-sections';
import { CURRENT_DOCUMENTATION_VERSION, DOCUMENTATION_VERSIONS } from '../../docs-versions';

@Component({
  selector: 'app-docs-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive, TranslatePipe],
  template: `
    <div class="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:flex-row sm:py-10">
      <div class="docs-mobile-toolbar sm:hidden">
        <div>
          <p class="docs-eyebrow">TS Typed</p>
          <p class="text-sm font-semibold text-white">{{ 'docs.nav.menu' | translate }}</p>
        </div>
        <button type="button" class="icon-button" aria-controls="mobile-docs-drawer" [attr.aria-expanded]="mobileMenuOpen()" (click)="openMenu()">
          <span class="sr-only">{{ 'docs.nav.openMenu' | translate }}</span>
          <span class="hamburger-icon" aria-hidden="true"><i></i><i></i><i></i></span>
        </button>
      </div>
      @if (mobileMenuOpen()) {
        <button type="button" class="docs-drawer-scrim sm:hidden" aria-label="Close documentation menu" (click)="closeMenu()"></button>
      }
      <aside id="mobile-docs-drawer" class="docs-mobile-drawer sm:hidden" [class.is-open]="mobileMenuOpen()" [attr.aria-hidden]="!mobileMenuOpen()">
        <div class="flex items-center justify-between border-b border-white/10 pb-4">
          <div><p class="docs-eyebrow">TS Typed</p><p class="font-semibold text-white">{{ 'docs.nav.menu' | translate }}</p></div>
          <button type="button" class="icon-button" (click)="closeMenu()">
            <span class="sr-only">{{ 'docs.nav.closeMenu' | translate }}</span><span class="close-icon" aria-hidden="true">×</span>
          </button>
        </div>
        <nav class="mt-5 flex flex-col gap-1 text-sm" aria-label="Documentation">
          <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500" for="mobile-documentation-version">{{ 'docs.nav.version' | translate }}</label>
          <select id="mobile-documentation-version" class="mb-4 rounded-lg border border-white/15 bg-slate-900 px-3 py-3 text-sm text-slate-200 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/30" [value]="version" (change)="setVersion($any($event.target).value)">
            @for (item of versions; track item.value) {<option [value]="item.value">{{ item.label }}{{ item.isLatest ? ' · latest' : '' }}</option>}
          </select>
          @for (section of sections; track section.slug) {
            <a [routerLink]="['/', lang, 'docs', version, section.slug]" routerLinkActive="is-active" class="docs-nav-link" (click)="closeMenu()">{{ section.titleKey | translate }}</a>
          }
        </nav>
      </aside>
      <aside class="hidden w-56 flex-shrink-0 sm:block">
        <nav class="sticky top-24 flex flex-col gap-1 text-sm" aria-label="Documentation">
          <label class="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500" for="documentation-version">{{ 'docs.nav.version' | translate }}</label>
          <select id="documentation-version" class="mb-4 rounded border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-cyan focus:outline-none" [value]="version" (change)="setVersion($any($event.target).value)">
            @for (item of versions; track item.value) {<option [value]="item.value">{{ item.label }}{{ item.isLatest ? ' · latest' : '' }}</option>}
          </select>
          @for (section of sections; track section.slug) {
            <a
              [routerLink]="['/', lang, 'docs', version, section.slug]"
              routerLinkActive="text-cyan font-semibold"
              class="docs-nav-link"
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
  public readonly mobileMenuOpen = signal(false);

  public constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.closeMenu();
    });
  }

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

  public openMenu(): void { this.mobileMenuOpen.set(true); }
  public closeMenu(): void { this.mobileMenuOpen.set(false); }

  @HostListener('document:keydown.escape')
  public onEscape(): void { if (this.mobileMenuOpen()) this.closeMenu(); }
}
