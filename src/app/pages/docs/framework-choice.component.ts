import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  buildDocumentationRoute,
  DOCUMENTATION_FRAMEWORKS,
  DocumentationFramework,
} from '../../docs-catalog';
import { CURRENT_DOCUMENTATION_VERSION } from '../../docs-versions';

@Component({
  selector: 'app-framework-choice',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="mx-auto max-w-3xl text-slate-200">
      <p class="text-sm font-semibold uppercase tracking-wider text-cyan">TS Typed</p>
      <h1 class="mt-3 text-3xl font-bold text-white">{{ isPortuguese ? 'Escolha o framework' : 'Choose a framework' }}</h1>
      <p class="mt-4 leading-7 text-slate-300">{{ isPortuguese ? 'Escolha seu framework para abrir os primeiros passos corretos para o seu projeto.' : 'Choose your framework to open the right getting-started guide for your project.' }}</p>
      <nav class="mt-8 grid gap-3 sm:grid-cols-3" [attr.aria-label]="'docs.nav.frameworks' | translate">
        @for (framework of frameworks; track framework) {
          @if (frameworkRoute(framework); as href) {
            <a class="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan hover:bg-cyan/10" [href]="href">
              <span class="font-semibold text-white">{{ frameworkLabel(framework) }}</span>
            </a>
          } @else {
            <span data-unavailable class="rounded-xl border border-white/10 bg-white/5 p-5 text-slate-400">
              {{ frameworkLabel(framework) }} unavailable
            </span>
          }
        }
      </nav>
    </article>
  `,
})
export class FrameworkChoiceComponent {
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly translate = inject(TranslateService);

  public readonly frameworks = DOCUMENTATION_FRAMEWORKS;

  public get isPortuguese(): boolean {
    return this.translate.getCurrentLang() === 'pt';
  }

  public frameworkRoute(framework: DocumentationFramework): string | undefined {
    const lang = (this.route?.snapshot.pathFromRoot.find((snapshot) => snapshot.paramMap.has('lang'))?.paramMap.get('lang') ?? this.translate.getCurrentLang()) || 'en';
    const version = this.route?.snapshot.paramMap.get('version') ?? CURRENT_DOCUMENTATION_VERSION;
    return buildDocumentationRoute(lang, framework, 'getting-started', version);
  }

  public frameworkLabel(framework: DocumentationFramework): string {
    return framework === 'typescript' ? 'TypeScript puro' : framework === 'express' ? 'Express' : 'NestJS';
  }
}
