import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLang = 'en' | 'pt';
export const SUPPORTED_LANGS: readonly SupportedLang[] = ['en', 'pt'];
const STORAGE_KEY = 'ts-typed-lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);

  public init(langFromUrl?: string): SupportedLang {
    this.translate.addLangs(SUPPORTED_LANGS as string[]);
    const resolved = this.resolve(langFromUrl);
    this.translate.use(resolved);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, resolved);
    }
    return resolved;
  }

  public detectPreferredLang(): SupportedLang {
    if (!isPlatformBrowser(this.platformId)) {
      return 'en';
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'pt') {
      return stored;
    }
    const browserLang = navigator.language?.toLowerCase() ?? 'en';
    return browserLang.startsWith('pt') ? 'pt' : 'en';
  }

  private resolve(langFromUrl?: string): SupportedLang {
    if (langFromUrl === 'en' || langFromUrl === 'pt') {
      return langFromUrl;
    }
    return this.detectPreferredLang();
  }
}
