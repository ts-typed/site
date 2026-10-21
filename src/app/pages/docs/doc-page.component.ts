import { ChangeDetectionStrategy, Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { TranslateService } from '@ngx-translate/core';
import {
  buildDocumentationContentPath,
  DocumentationFramework,
  DocumentationPage,
  findDocumentationPage,
} from '../../docs-catalog';
import { getDocumentationVersion } from '../../docs-versions';
import { DocumentNavigationComponent } from './document-navigation.component';

export interface DocumentationRouteContext {
  readonly lang: string;
  readonly version: string;
  readonly slug: string;
  readonly framework?: string;
}

@Component({
  selector: 'app-doc-page',
  standalone: true,
  imports: [MarkdownModule, DocumentNavigationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (page(); as document) {
      <article class="prose prose-invert max-w-none prose-pre:bg-slate-950 prose-a:text-cyan">
        <markdown [src]="src()"></markdown>
      </article>
      <app-document-navigation [page]="document" [lang]="context().lang" [version]="context().version" />
    } @else {
      <article class="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-slate-200">
        <h1 class="text-2xl font-bold text-white">Documentation unavailable</h1>
        <p class="mt-3 leading-7 text-slate-300">This documentation page does not exist for the selected language, version, or framework.</p>
        <a class="mt-6 inline-block text-cyan underline" href="/">Return to documentation home</a>
      </article>
    }
  `,
})
export class DocPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);
  public readonly src = signal('');
  public readonly page = signal<DocumentationPage | undefined>(undefined);
  public readonly context = signal<DocumentationRouteContext>({ lang: 'en', version: getDocumentationVersion(null).value, slug: 'introduction' });

  public constructor() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const lang = (this.route.snapshot.pathFromRoot.find((snapshot) => snapshot.paramMap.has('lang'))?.paramMap.get('lang') ?? this.translate.getCurrentLang()) || 'en';
      this.resolveDocument({
        lang,
        version: params.get('version') ?? getDocumentationVersion(null).value,
        framework: params.get('framework') ?? undefined,
        slug: params.get('slug') ?? 'introduction',
      });
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo(0, 0);
      }
    });
  }

  public resolveDocument(context: DocumentationRouteContext): void {
    this.context.set(context);
    const framework = context.framework as DocumentationFramework | undefined;
    const page = findDocumentationPage(context.slug, framework);
    const src = buildDocumentationContentPath(context.lang, framework, context.slug, context.version);
    this.page.set(src ? page : undefined);
    this.src.set(src ?? '');
  }
}
