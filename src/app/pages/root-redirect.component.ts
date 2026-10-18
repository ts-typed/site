import { Component, inject, afterNextRender } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../services/language.service';

@Component({ selector: 'app-root-redirect', standalone: true, template: '' })
export class RootRedirectComponent {
  private readonly router = inject(Router);
  private readonly lang = inject(LanguageService);

  public constructor() {
    afterNextRender(() => {
      const target = this.lang.detectPreferredLang();
      this.router.navigate(['/', target], { replaceUrl: true });
    });
  }
}
