import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DOCUMENTATION_FRAMEWORKS, DocumentationFramework, findDocumentationPage, getNavigationItems } from '../../docs-catalog';
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
        <button type="button" class="docs-drawer-scrim sm:hidden" [attr.aria-label]="'docs.nav.closeMenu' | translate" (click)="closeMenu()"></button>
      }
      @if (mobileMenuOpen()) {
      <aside id="mobile-docs-drawer" class="docs-mobile-drawer sm:hidden is-open">
        <div class="flex items-center justify-between border-b border-white/10 pb-4">
          <div><p class="docs-eyebrow">TS Typed</p><p class="font-semibold text-white">{{ 'docs.nav.menu' | translate }}</p></div>
          <button type="button" class="icon-button" (click)="closeMenu()">
            <span class="sr-only">{{ 'docs.nav.closeMenu' | translate }}</span><span class="close-icon" aria-hidden="true">×</span>
          </button>
        </div>
        <nav class="mt-5 flex flex-col gap-1 text-sm" [attr.aria-label]="'docs.nav.documentation' | translate">
          <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500" for="mobile-documentation-version">{{ 'docs.nav.version' | translate }}</label>
          <select id="mobile-documentation-version" class="mb-4 rounded-lg border border-white/15 bg-slate-900 px-3 py-3 text-sm text-slate-200 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/30" [value]="version" (change)="setVersion($any($event.target).value)">
            @for (item of versions; track item.value) {<option [value]="item.value">{{ item.label }}{{ item.isLatest ? ' · latest' : '' }}</option>}
          </select>
          <ng-container *ngTemplateOutlet="navigationTemplate; context: { mobile: true }" />
        </nav>
      </aside>
      }
      <aside class="hidden w-56 flex-shrink-0 sm:block">
        <nav class="sticky top-24 flex flex-col gap-1 text-sm" [attr.aria-label]="'docs.nav.documentation' | translate">
          <label class="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500" for="documentation-version">{{ 'docs.nav.version' | translate }}</label>
          <select id="documentation-version" class="mb-4 rounded border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-cyan focus:outline-none" [value]="version" (change)="setVersion($any($event.target).value)">
            @for (item of versions; track item.value) {<option [value]="item.value">{{ item.label }}{{ item.isLatest ? ' · latest' : '' }}</option>}
          </select>
          <ng-container *ngTemplateOutlet="navigationTemplate" />
        </nav>
      </aside>
      <div class="min-w-0 flex-1"><router-outlet /></div>
    </div>

    <ng-template #navigationTemplate let-mobile="mobile">
      <div data-navigation="global" class="docs-nav-group">
        @for (section of primarySections; track section.slug) {
          <a [routerLink]="['/', lang, 'docs', version, section.slug]" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }" class="docs-nav-link" (click)="mobile ? closeMenu() : null">{{ section.titleKey | translate }}</a>
        }
      </div>
      @for (group of frameworkGroups; track group.framework) {
        <section class="docs-nav-group" data-framework-group [attr.data-framework-group]="group.framework" [class.is-active]="isFrameworkActive(group.framework)">
          <div class="docs-framework-heading">
            <a class="docs-nav-link docs-framework-title" [routerLink]="frameworkOverviewLink(group.framework)" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }" (click)="mobile ? closeMenu() : null">{{ group.titleKey | translate }}</a>
            <button type="button" class="docs-framework-toggle" [attr.data-framework-toggle]="group.framework" [attr.aria-expanded]="isFrameworkExpanded(group.framework)" [attr.aria-controls]="submenuId(group.framework, mobile)" (click)="toggleFramework(group.framework)" (keydown.space)="toggleFramework(group.framework); $event.preventDefault()">
              <span class="sr-only">{{ (isFrameworkExpanded(group.framework) ? 'docs.nav.collapse' : 'docs.nav.expand') | translate }} {{ group.titleKey | translate }}</span>
              <span class="docs-framework-chevron" [class.is-expanded]="isFrameworkExpanded(group.framework)" aria-hidden="true">›</span>
            </button>
          </div>
          @if (isFrameworkExpanded(group.framework)) {
            <div class="docs-framework-submenu" [attr.id]="submenuId(group.framework, mobile)" [attr.data-framework-submenu]="group.framework">
              @for (item of group.items; track item.slug) {
                <a class="docs-nav-link docs-framework-link" [attr.data-framework-link]="group.framework + '/' + item.slug" [class.is-active]="isItemActive(group.framework, item.slug)" [routerLink]="['/', lang, 'docs', version, group.framework, item.slug]" (click)="mobile ? closeMenu() : null">{{ item.titleKey | translate }}</a>
              }
            </div>
          }
        </section>
      }
      @for (section of preConceptSections; track section.slug) {
        <a [routerLink]="['/', lang, 'docs', version, section.slug]" class="docs-nav-link" (click)="mobile ? closeMenu() : null">{{ section.titleKey | translate }}</a>
      }
      <section class="docs-nav-group" [class.is-active]="isCoreConceptActive()">
        <div class="docs-framework-heading">
          <a class="docs-nav-link docs-core-concepts-title" [routerLink]="['/', lang, 'docs', version, 'core-concepts']" (click)="mobile ? closeMenu() : null">{{ 'docs.nav.coreConcepts' | translate }}</a>
          <button type="button" class="docs-framework-toggle" [attr.aria-expanded]="coreConceptsOpen()" [attr.aria-controls]="'docs-core-concepts-' + (mobile ? 'mobile' : 'desktop')" (click)="coreConceptsOpen.set(!coreConceptsOpen())">
            <span class="sr-only">{{ (coreConceptsOpen() ? 'docs.nav.collapse' : 'docs.nav.expand') | translate }} {{ 'docs.nav.coreConcepts' | translate }}</span>
            <span class="docs-framework-chevron" [class.is-expanded]="coreConceptsOpen()" aria-hidden="true">›</span>
          </button>
        </div>
        @if (coreConceptsOpen()) {
          <div class="docs-framework-submenu" [attr.id]="'docs-core-concepts-' + (mobile ? 'mobile' : 'desktop')">
            @for (section of conceptSections; track section.slug) {
              <a [routerLink]="['/', lang, 'docs', version, section.slug]" class="docs-nav-link docs-framework-link" (click)="mobile ? closeMenu() : null">{{ section.titleKey | translate }}</a>
            }
          </div>
        }
      </section>
      @for (section of postConceptSections; track section.slug) {
        <a [routerLink]="['/', lang, 'docs', version, section.slug]" class="docs-nav-link" (click)="mobile ? closeMenu() : null">{{ section.titleKey | translate }}</a>
      }
    </ng-template>
  `,
})
export class DocsLayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  public readonly sections = getNavigationItems();
  public readonly primarySections = this.sections.filter((section) => ['introduction', 'getting-started'].includes(section.slug));
  public readonly conceptSections = this.sections.filter((section) => ['core-concepts', 'errors', 'decorators', 'value-object', 'generics'].includes(section.slug));
  public readonly preConceptSections = this.sections.filter((section) => ['configuration', 'validators'].includes(section.slug));
  public readonly postConceptSections = this.sections.filter((section) => ['limitations', 'optimizations', 'performance', 'benchmarks'].includes(section.slug));
  public readonly frameworkGroups = DOCUMENTATION_FRAMEWORKS.map((framework) => ({
    framework,
    titleKey: `docs.nav.${framework}`,
    items: getNavigationItems(framework),
  }));
  public readonly versions = DOCUMENTATION_VERSIONS;
  public readonly mobileMenuOpen = signal(false);
  public readonly coreConceptsOpen = signal(false);
  private readonly expandedFrameworks = signal<DocumentationFramework[]>([]);

  public constructor() {
    const framework = this.currentFramework;
    if (framework) this.expandedFrameworks.set([framework]);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeMenu();
        const nextFramework = this.currentFramework;
        if (nextFramework && !this.expandedFrameworks().includes(nextFramework)) this.expandedFrameworks.update((items) => [...items, nextFramework]);
      }
    });
  }

  public get lang(): string {
    return this.translate.getCurrentLang() || 'en';
  }

  public get version(): string {
    return this.route.firstChild?.snapshot?.paramMap.get('version') ?? CURRENT_DOCUMENTATION_VERSION;
  }

  private get currentFramework(): DocumentationFramework | undefined {
    const value = this.route.firstChild?.snapshot?.paramMap.get('framework') ?? undefined;
    return DOCUMENTATION_FRAMEWORKS.includes(value as DocumentationFramework) ? value as DocumentationFramework : undefined;
  }

  private get currentSlug(): string {
    return this.route.firstChild?.snapshot?.paramMap.get('slug') ?? 'introduction';
  }

  public frameworkOverviewLink(framework: DocumentationFramework): string[] {
    return ['/', this.lang, 'docs', this.version, framework, 'introduction'];
  }

  public submenuId(framework: DocumentationFramework, mobile = false): string {
    return `docs-submenu-${mobile ? 'mobile' : 'desktop'}-${framework}`;
  }

  public isFrameworkExpanded(framework: DocumentationFramework): boolean {
    return this.expandedFrameworks().includes(framework);
  }

  public toggleFramework(framework: DocumentationFramework): void {
    this.expandedFrameworks.update((items) => items.includes(framework) ? items.filter((item) => item !== framework) : [...items, framework]);
  }

  public isFrameworkActive(framework: DocumentationFramework): boolean {
    return this.currentFramework === framework;
  }

  public isCoreConceptActive(): boolean {
    return this.conceptSections.some((section) => section.slug === this.currentSlug);
  }

  public isItemActive(framework: DocumentationFramework, slug: string): boolean {
    return this.isFrameworkActive(framework) && this.currentSlug === slug;
  }

  public setVersion(version: string): void {
    const framework = this.currentFramework;
    const requestedSlug = this.currentSlug;
    const slug = findDocumentationPage(requestedSlug, framework)?.slug ?? 'introduction';
    this.router.navigate(['/', this.lang, 'docs', version, ...(framework ? [framework] : []), slug]);
  }

  public openMenu(): void { this.mobileMenuOpen.set(true); }
  public closeMenu(): void { this.mobileMenuOpen.set(false); }

  @HostListener('document:keydown.escape')
  public onEscape(): void { if (this.mobileMenuOpen()) this.closeMenu(); }
}
