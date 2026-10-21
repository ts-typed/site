import { CURRENT_DOCUMENTATION_VERSION, DOCUMENTATION_VERSIONS, DocumentationVersion } from './docs-versions';
import { SUPPORTED_LANGS, SupportedLang } from './services/language.service';

export const SUPPORTED_DOCUMENTATION_LANGUAGES = SUPPORTED_LANGS;
export type DocumentationLanguage = SupportedLang;
export const DOCUMENTATION_FRAMEWORKS = ['typescript', 'express', 'nestjs'] as const;
export type DocumentationFramework = (typeof DOCUMENTATION_FRAMEWORKS)[number];

export type DocumentationPageContext = 'global' | 'framework';

export interface DocumentationPage {
  readonly slug: string;
  readonly titleKey: string;
  readonly content: string;
  readonly order: number;
  readonly context: DocumentationPageContext;
  readonly framework?: DocumentationFramework;
  readonly followUp?: string;
  readonly deepening: readonly string[];
}

export interface DocumentationNavigationItem {
  readonly slug: string;
  readonly titleKey: string;
  readonly context: DocumentationPageContext;
  readonly framework?: DocumentationFramework;
}

export interface DocumentationNeighbors {
  readonly previous?: DocumentationPage;
  readonly next?: DocumentationPage;
}

const globalPages: readonly DocumentationPage[] = [
  { slug: 'introduction', titleKey: 'docs.nav.introduction', content: 'introduction.md', order: 10, context: 'global', deepening: ['core-concepts'] },
  { slug: 'getting-started', titleKey: 'docs.nav.gettingStarted', content: 'getting-started.md', order: 20, context: 'global', deepening: ['configuration'] },
  { slug: 'core-concepts', titleKey: 'docs.nav.coreConcepts', content: 'core-concepts.md', order: 50, context: 'global', deepening: ['value-object', 'generics'] },
  { slug: 'configuration', titleKey: 'docs.nav.configuration', content: 'configuration.md', order: 40, context: 'global', deepening: ['optimizations'] },
  { slug: 'decorators', titleKey: 'docs.nav.decorators', content: 'decorators.md', order: 50, context: 'global', deepening: ['validators'] },
  { slug: 'value-object', titleKey: 'docs.nav.valueObject', content: 'value-object.md', order: 60, context: 'global', deepening: ['core-concepts'] },
  { slug: 'generics', titleKey: 'docs.nav.generics', content: 'generics.md', order: 70, context: 'global', deepening: ['core-concepts'] },
  { slug: 'validators', titleKey: 'docs.nav.validators', content: 'validators.md', order: 80, context: 'global', deepening: ['decorators'] },
  { slug: 'limitations', titleKey: 'docs.nav.limitations', content: 'limitations.md', order: 90, context: 'global', deepening: ['configuration'] },
  { slug: 'performance', titleKey: 'docs.nav.performance', content: 'performance.md', order: 100, context: 'global', deepening: ['optimizations'] },
  { slug: 'optimizations', titleKey: 'docs.nav.optimizations', content: 'optimizations.md', order: 110, context: 'global', deepening: ['performance'] },
  { slug: 'benchmarks', titleKey: 'docs.nav.benchmarks', content: 'benchmarks.md', order: 120, context: 'global', deepening: ['performance', 'optimizations'] },
];

const frameworkPages: readonly DocumentationPage[] = DOCUMENTATION_FRAMEWORKS.flatMap((framework) => [
  { slug: 'introduction', titleKey: 'docs.nav.introduction', content: 'introduction.md', order: 10, context: 'framework' as const, framework, deepening: ['core-concepts'] },
  { slug: 'getting-started', titleKey: 'docs.nav.gettingStarted', content: 'getting-started.md', order: 20, context: 'framework' as const, framework, deepening: ['core-concepts'] },
  { slug: 'configuration', titleKey: 'docs.nav.configuration', content: 'configuration.md', order: 30, context: 'framework' as const, framework, deepening: ['core-concepts'] },
  { slug: 'implementation', titleKey: 'docs.nav.implementation', content: 'implementation.md', order: 40, context: 'framework' as const, framework, deepening: ['configuration'] },
  { slug: 'requests-dtos', titleKey: 'docs.nav.requestsDtos', content: 'requests-dtos.md', order: 50, context: 'framework' as const, framework, deepening: ['responses', 'errors'] },
  { slug: 'responses', titleKey: 'docs.nav.responses', content: 'responses.md', order: 60, context: 'framework' as const, framework, deepening: ['errors'] },
  { slug: 'errors', titleKey: 'docs.nav.errors', content: 'errors.md', order: 70, context: 'framework' as const, framework, deepening: ['limitations'] },
  { slug: 'practices-examples', titleKey: 'docs.nav.practicesExamples', content: 'practices-examples.md', order: 80, context: 'framework' as const, framework, followUp: 'core-concepts', deepening: ['performance', 'optimizations'] },
]);

export const DOCUMENTATION_CATALOG: readonly DocumentationPage[] = Object.freeze([...globalPages, ...frameworkPages]);

function isLanguage(value: string): value is DocumentationLanguage {
  return (SUPPORTED_LANGS as readonly string[]).includes(value);
}

function isFramework(value: string | undefined): value is DocumentationFramework {
  return value === undefined || (DOCUMENTATION_FRAMEWORKS as readonly string[]).includes(value);
}

export function findDocumentationPage(slug: string, framework?: string): DocumentationPage | undefined {
  if (!isFramework(framework)) return undefined;
  return DOCUMENTATION_CATALOG.find((page) => page.slug === slug && (framework ? page.framework === framework : page.context === 'global'));
}

export function getNavigationItems(framework?: DocumentationFramework): readonly DocumentationNavigationItem[] {
  return DOCUMENTATION_CATALOG
    .filter((page) => framework ? page.framework === framework : page.context === 'global')
    .sort((a, b) => a.order - b.order)
    .map(({ slug, titleKey, context, framework: pageFramework }) => ({ slug, titleKey, context, framework: pageFramework }));
}

export function getDocumentNeighbors(slug: string, framework?: DocumentationFramework): DocumentationNeighbors {
  const sequence = framework ? getNavigationItems(framework).map((item) => findDocumentationPage(item.slug, framework)!) : globalPages;
  return getDocumentNeighborsFromPages(slug, sequence);
}

/** Resolves neighbors for a declared sequence; useful for validating catalog flows. */
export function getDocumentNeighborsFromPages(slug: string, sequence: readonly DocumentationPage[]): DocumentationNeighbors {
  const page = sequence.find((item) => item.slug === slug);
  if (!page) return {};
  const index = sequence.findIndex((item) => item.slug === slug);
  return {
    previous: index > 0 ? sequence[index - 1] : undefined,
    next: index === sequence.length - 1 && page.followUp ? findDocumentationPage(page.followUp) : sequence[index + 1],
  };
}

export function getDeepeningLinks(slug: string, framework?: DocumentationFramework): readonly DocumentationPage[] {
  const page = findDocumentationPage(slug, framework);
  return page?.deepening.slice(0, 3)
    .map((linkSlug) => findDocumentationPage(linkSlug, framework) ?? findDocumentationPage(linkSlug))
    .filter((link): link is DocumentationPage => link !== undefined) ?? [];
}

function versionDirectory(version: DocumentationVersion | string): string {
  return typeof version === 'string' ? version : version.directory ?? '';
}

function resolveVersion(version: DocumentationVersion | string): DocumentationVersion | undefined {
  return DOCUMENTATION_VERSIONS.find((candidate) => candidate.value === (typeof version === 'string' ? version : version.value));
}

export function buildDocumentationRoute(language: string, framework: string | undefined, slug: string, version: string = CURRENT_DOCUMENTATION_VERSION): string | undefined {
  if (!isLanguage(language) || !isFramework(framework) || !findDocumentationPage(slug, framework) || !resolveVersion(version)) return undefined;
  const frameworkSegment = framework ? `/${framework}` : '';
  return `/${language}/docs/${version}${frameworkSegment}/${slug}`;
}

export function buildDocumentationContentPath(language: string, framework: string | undefined, slug: string, version: DocumentationVersion | string = DOCUMENTATION_VERSIONS[0]): string | undefined {
  const resolvedVersion = resolveVersion(version);
  if (!isLanguage(language) || !isFramework(framework) || !findDocumentationPage(slug, framework) || !resolvedVersion) return undefined;
  const directory = versionDirectory(resolvedVersion);
  const versionPrefix = directory ? `/${directory}` : '';
  return `/docs${versionPrefix}/${language}${framework ? `/${framework}` : ''}/${slug}.md`;
}
