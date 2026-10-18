import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-doc-page',
  standalone: true,
  imports: [MarkdownModule],
  template: `
    <article class="prose prose-invert max-w-none prose-pre:bg-slate-950 prose-a:text-cyan">
      <markdown [src]="src()"></markdown>
    </article>
  `,
})
export class DocPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);
  public readonly src = signal('');

  public constructor() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const slug = params.get('slug') ?? 'introduction';
      const lang = this.translate.getCurrentLang() || 'en';
      this.src.set(`/docs/${lang}/${slug}.md`);
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo(0, 0);
      }
    });
  }
}
