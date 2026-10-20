export interface DocSection {
  readonly slug: string;
  readonly titleKey: string;
}

export const DOC_SECTIONS: readonly DocSection[] = [
  { slug: 'introduction', titleKey: 'docs.nav.introduction' },
  { slug: 'getting-started', titleKey: 'docs.nav.gettingStarted' },
  { slug: 'core-concepts', titleKey: 'docs.nav.coreConcepts' },
  { slug: 'configuration', titleKey: 'docs.nav.configuration' },
  { slug: 'decorators', titleKey: 'docs.nav.decorators' },
  { slug: 'value-object', titleKey: 'docs.nav.valueObject' },
  { slug: 'generics', titleKey: 'docs.nav.generics' },
  { slug: 'nestjs', titleKey: 'docs.nav.nestjs' },
  { slug: 'validators', titleKey: 'docs.nav.validators' },
  { slug: 'limitations', titleKey: 'docs.nav.limitations' },
  { slug: 'performance', titleKey: 'docs.nav.performance' },
  { slug: 'optimizations', titleKey: 'docs.nav.optimizations' },
];
