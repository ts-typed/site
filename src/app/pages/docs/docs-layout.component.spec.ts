import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { DocsLayoutComponent } from './docs-layout.component';
import { DOCUMENTATION_FRAMEWORKS } from '../../docs-catalog';

function routeWith(params: Record<string, string>): ActivatedRoute {
  return {
    firstChild: { snapshot: { paramMap: convertToParamMap(params) } },
  } as unknown as ActivatedRoute;
}

describe('DocsLayoutComponent navigation', () => {
  let fixture: ComponentFixture<DocsLayoutComponent>;

  async function create(params: Record<string, string> = { version: '0.1', slug: 'introduction' }): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [DocsLayoutComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en', lang: 'en' }),
        { provide: ActivatedRoute, useValue: routeWith(params) },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DocsLayoutComponent);
    fixture.detectChanges();
  }

  it('keeps global navigation items visible alongside every framework group', async () => {
    await create();

    expect(fixture.nativeElement.querySelectorAll('[data-navigation="global"] .docs-nav-link').length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelectorAll('[data-framework-group]')).toHaveLength(DOCUMENTATION_FRAMEWORKS.length);
  });

  it('expands a framework submenu with its separate keyboard-accessible control', async () => {
    await create();

    const toggle = fixture.nativeElement.querySelector('[data-framework-toggle="express"]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('[data-framework-submenu="express"]')).toBeNull();

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    fixture.componentInstance.openMenu();
    fixture.detectChanges();
    const submenus = fixture.nativeElement.querySelectorAll('[data-framework-submenu="express"]');
    expect(submenus).toHaveLength(2);
    expect(new Set(Array.from(submenus, (submenu) => (submenu as HTMLElement).id)).size).toBe(2);

    toggle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('marks the active framework and page from the current route state', async () => {
    await create({ version: '0.1', framework: 'nestjs', slug: 'requests-dtos' });

    expect(fixture.nativeElement.querySelector('[data-framework-group="nestjs"].is-active')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-framework-link="nestjs/requests-dtos"].is-active')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-framework-toggle="nestjs"]').getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps equivalent framework controls in the mobile drawer', async () => {
    await create();

    expect(fixture.nativeElement.querySelector('#mobile-docs-drawer')).toBeNull();
    fixture.componentInstance.openMenu();
    fixture.detectChanges();
    const drawer = fixture.nativeElement.querySelector('#mobile-docs-drawer') as HTMLElement;
    expect(drawer.querySelectorAll('[data-framework-group]')).toHaveLength(DOCUMENTATION_FRAMEWORKS.length);
    expect(drawer.querySelectorAll('[data-framework-toggle]').length).toBe(DOCUMENTATION_FRAMEWORKS.length);
    expect(drawer.querySelector('[data-navigation="global"] .docs-nav-link')).toBeTruthy();
  });

  it('renders while the child documentation route is not activated yet', async () => {
    await TestBed.configureTestingModule({
      imports: [DocsLayoutComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en', lang: 'en' }),
        { provide: ActivatedRoute, useValue: { firstChild: {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocsLayoutComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('preserves the framework and safely falls back when changing versions', async () => {
    await create({ version: '0.1', framework: 'express', slug: 'requests-dtos' });
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.setVersion('0.2');
    expect(navigate).toHaveBeenCalledWith(['/', 'en', 'docs', '0.2', 'express', 'requests-dtos']);

    navigate.mockClear();
    (TestBed.inject(ActivatedRoute).firstChild!.snapshot as unknown as { paramMap: ReturnType<typeof convertToParamMap> }).paramMap = convertToParamMap({ version: '0.1', framework: 'express', slug: 'unknown' });
    fixture.componentInstance.setVersion('0.2');
    expect(navigate).toHaveBeenCalledWith(['/', 'en', 'docs', '0.2', 'express', 'introduction']);
  });
});
