import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { LanguageService, SupportedLang } from './language.service';

export const langResolver: ResolveFn<SupportedLang> = (route) => {
  const service = inject(LanguageService);
  return service.init(route.paramMap.get('lang') ?? undefined);
};
