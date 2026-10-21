import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { DocumentationPage, findDocumentationPage } from '../../docs-catalog';
import { DocumentNavigationComponent } from './document-navigation.component';

describe('DocumentNavigationComponent', () => {
  beforeEach((): void => {
    TestBed.resetTestingModule();
  });
  const createFixture = async (page: DocumentationPage, lang = 'en'): Promise<ComponentFixture<DocumentNavigationComponent>> => {
    await TestBed.configureTestingModule({
      imports: [DocumentNavigationComponent],
      providers: [provideRouter([]), provideTranslateService({ fallbackLang: lang, lang })],
    }).compileComponents();

    const fixture = TestBed.createComponent(DocumentNavigationComponent);
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('lang', lang);
    fixture.componentRef.setInput('version', '0.1');
    fixture.detectChanges();
    return fixture;
  };

  it('renders the localized central-concepts hint for typed boundaries', async () => {
    const fixture = await createFixture(findDocumentationPage('introduction')!);
    const deepening = fixture.nativeElement.querySelector('[data-deepening]') as HTMLElement;

    expect(deepening.textContent).toContain('docs.navigation.deepen');
    expect(deepening.querySelectorAll('a')).toHaveLength(1);
    expect((deepening.querySelector('a') as HTMLAnchorElement).getAttribute('href')).toBe('/en/docs/0.1/core-concepts');
  });

  it('renders both previous and next neighbors for a middle page', async () => {
    const fixture = await createFixture(findDocumentationPage('core-concepts')!);
    const navigation = fixture.nativeElement.querySelector('[data-document-navigation]') as HTMLElement;
    const links = Array.from(navigation.querySelectorAll('a')) as HTMLAnchorElement[];

    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/en/docs/0.1/getting-started', '/en/docs/0.1/configuration']);
  });

  it('omits only the unavailable neighbor at the first and last pages', async () => {
    const firstFixture = await createFixture(findDocumentationPage('introduction')!);
    expect(firstFixture.nativeElement.querySelector('[data-previous]')).toBeNull();
    expect(firstFixture.nativeElement.querySelector('[data-next]')).not.toBeNull();
    firstFixture.componentRef.setInput('page', findDocumentationPage('benchmarks')!);
    firstFixture.detectChanges();

    expect(firstFixture.nativeElement.querySelector('[data-previous]')).not.toBeNull();
    expect(firstFixture.nativeElement.querySelector('[data-next]')).toBeNull();
  });

  it('points the final framework page to its configured global continuation', async () => {
    const fixture = await createFixture(findDocumentationPage('practices-examples', 'nestjs')!);
    const next = fixture.nativeElement.querySelector('[data-next]') as HTMLAnchorElement;

    expect(next.getAttribute('href')).toBe('/en/docs/0.1/core-concepts');
  });
});
