import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { DOCUMENTATION_FRAMEWORKS } from '../../docs-catalog';
import { routes } from '../../app.routes';
import { FrameworkChoiceComponent } from './framework-choice.component';
import { DocPageComponent } from './doc-page.component';

describe('canonical documentation routes', () => {
  it('keeps the global overview route free of a framework parameter', () => {
    const docsRoute = routes.find((route) => route.path === ':lang')?.children?.find((route) => route.path === 'docs');
    const childPaths = docsRoute?.children?.map((route) => route.path);

    expect(childPaths).toContain(':version/:slug');
    expect(childPaths).toContain(':version/:framework/:slug');
  });

  it('resolves a canonical Nest route to Nest-only Markdown', async () => {
    await TestBed.configureTestingModule({
      imports: [DocPageComponent],
      providers: [provideRouter(routes), provideTranslateService({ fallbackLang: 'en', lang: 'en' })],
    }).compileComponents();

    const fixture = TestBed.createComponent(DocPageComponent);
    const component = fixture.componentInstance;
    component.resolveDocument({ lang: 'en', version: '0.1', framework: 'nestjs', slug: 'requests-dtos' });

    expect(component.src()).toBe('/docs/en/nestjs/requests-dtos.md');
    expect(component.page()?.framework).toBe('nestjs');
  });

  it('clears the document when language or version is invalid', async () => {
    await TestBed.configureTestingModule({
      imports: [DocPageComponent],
      providers: [provideRouter(routes), provideTranslateService({ fallbackLang: 'en', lang: 'en' })],
    }).compileComponents();

    const fixture = TestBed.createComponent(DocPageComponent);
    const component = fixture.componentInstance;
    component.resolveDocument({ lang: 'xx', version: '9.9', framework: 'nestjs', slug: 'requests-dtos' });

    expect(component.page()).toBeUndefined();
    expect(component.src()).toBe('');
  });
});

describe('FrameworkChoiceComponent', () => {
  let fixture: ComponentFixture<FrameworkChoiceComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [FrameworkChoiceComponent],
      providers: [provideTranslateService({ fallbackLang: 'en', lang: 'en' })],
    }).compileComponents();
    fixture = TestBed.createComponent(FrameworkChoiceComponent);
    fixture.detectChanges();
  });

  it('shows every valid framework choice for an ambiguous legacy requests link', (): void => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];

    expect(links).toHaveLength(DOCUMENTATION_FRAMEWORKS.length);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/en/docs/0.1/typescript/getting-started',
      '/en/docs/0.1/express/getting-started',
      '/en/docs/0.1/nestjs/getting-started',
    ]);
    expect(fixture.nativeElement.querySelector('[data-return-url]')).toBeNull();
  });

  it('does not interpolate invalid legacy language or version into a link', async (): Promise<void> => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [FrameworkChoiceComponent],
      providers: [
        provideTranslateService({ fallbackLang: 'en', lang: 'en' }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ version: '9.9' }),
              pathFromRoot: [{ paramMap: convertToParamMap({ lang: 'xx' }) }],
            },
          },
        },
      ],
    }).compileComponents();
    const invalidFixture = TestBed.createComponent(FrameworkChoiceComponent);
    invalidFixture.detectChanges();

    expect(invalidFixture.nativeElement.querySelectorAll('a')).toHaveLength(0);
    expect(invalidFixture.nativeElement.querySelectorAll('[data-unavailable]')).toHaveLength(DOCUMENTATION_FRAMEWORKS.length);
  });
});
