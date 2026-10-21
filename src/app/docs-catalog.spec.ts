import {
  DOCUMENTATION_CATALOG,
  findDocumentationPage,
  getDeepeningLinks,
  getDocumentNeighbors,
  getNavigationItems,
  getDocumentNeighborsFromPages,
  buildDocumentationContentPath,
  buildDocumentationRoute,
} from './docs-catalog';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('documentation catalog', () => {
  it('resolves global pages and framework pages independently', () => {
    expect(findDocumentationPage('introduction', undefined)?.context).toBe('global');
    expect(findDocumentationPage('getting-started', 'express')?.context).toBe('framework');
    expect(findDocumentationPage('getting-started', 'express')?.framework).toBe('express');
  });

  it('exposes the configured framework submenu in order', () => {
    expect(getNavigationItems('express').map((item) => item.slug)).toEqual([
      'introduction',
      'getting-started',
      'configuration',
      'implementation',
      'requests-dtos',
      'responses',
      'errors',
      'practices-examples',
    ]);
  });

  it('rejects unknown frameworks and slugs safely', () => {
    expect(findDocumentationPage('does-not-exist', 'express')).toBeUndefined();
    expect(findDocumentationPage('introduction', 'does-not-exist')).toBeUndefined();
    expect(buildDocumentationRoute('en', 'express', 'does-not-exist')).toBeUndefined();
    expect(buildDocumentationContentPath('en', 'express', 'does-not-exist')).toBeUndefined();
  });

  it('returns from a framework flow to its configured global follow-up', () => {
    const neighbors = getDocumentNeighbors('practices-examples', 'express');

    expect(neighbors.next?.slug).toBe('core-concepts');
    expect(neighbors.next?.context).toBe('global');
  });

  it('keeps intermediate framework pages inside the submenu', () => {
    expect(getDocumentNeighbors('configuration', 'express').next?.context).toBe('framework');
    expect(getDocumentNeighbors('configuration', 'express').next?.slug).toBe('implementation');
  });

  it('cannot let an intermediate followUp skip the next page', () => {
    const pages = [
      { ...findDocumentationPage('configuration', 'express')!, followUp: 'core-concepts' },
      findDocumentationPage('introduction', 'express')!,
    ];

    expect(getDocumentNeighborsFromPages('configuration', pages).next?.slug).toBe('introduction');
  });

  it('resolves deepening links to global pages', () => {
    const links = getDeepeningLinks('getting-started', 'express');

    expect(links.length).toBeGreaterThan(0);
    expect(links.every((link) => link.context === 'global')).toBe(true);
    expect(links.map((link) => link.slug)).toContain('core-concepts');
  });

  it('preserves the framework context when a deepening page exists there', () => {
    const links = getDeepeningLinks('requests-dtos', 'express');

    expect(links.map((link) => link.slug)).toEqual(['responses', 'errors']);
    expect(links.every((link) => link.context === 'framework' && link.framework === 'express')).toBe(true);
  });

  it('keeps the catalog metadata readonly and paths canonical', () => {
    expect(DOCUMENTATION_CATALOG.length).toBeGreaterThan(0);
    expect(buildDocumentationRoute('pt', 'express', 'getting-started')).toBe('/pt/docs/0.1/express/getting-started');
    expect(buildDocumentationContentPath('pt', 'express', 'getting-started')).toBe('/docs/pt/express/getting-started.md');
    expect(buildDocumentationRoute('pt', 'express', 'getting-started', '9.9')).toBeUndefined();
    expect(buildDocumentationContentPath('pt', 'express', 'getting-started', '9.9')).toBeUndefined();
  });

  it('declares the implementation flow for every supported framework', () => {
    for (const framework of ['typescript', 'express', 'nestjs'] as const) {
      expect(getNavigationItems(framework).map((item) => item.slug)).toEqual([
        'introduction', 'getting-started', 'configuration', 'implementation',
        'requests-dtos', 'responses', 'errors', 'practices-examples',
      ]);
    }
  });

  it('has a Markdown asset for every declared page and locale', () => {
    for (const language of ['en', 'pt'] as const) {
      for (const page of DOCUMENTATION_CATALOG) {
        const relativePath = page.framework
          ? `public/docs/${language}/${page.framework}/${page.content}`
          : `public/docs/${language}/${page.content}`;
        expect(existsSync(resolve(process.cwd(), relativePath))).toBe(true);
      }
    }
  });

  it('documents the confirmed CLI integration hooks', () => {
    const docsRoot = resolve(process.cwd(), 'public/docs');
    for (const language of ['en', 'pt'] as const) {
      const express = readFileSync(resolve(docsRoot, language, 'express', 'implementation.md'), 'utf8');
      const expressErrors = readFileSync(resolve(docsRoot, language, 'express', 'errors.md'), 'utf8');
      const nest = readFileSync(resolve(docsRoot, language, 'nestjs', 'getting-started.md'), 'utf8');

      expect(express).toContain('typedErrorHandler');
      expect(expressErrors).toContain('typedErrorHandler');
      expect(express).not.toContain('strictTypeErrorMiddleware');
      expect(expressErrors).not.toContain('strictTypeErrorMiddleware');
      expect(nest).toContain('@ts-typed/nestjs');
    }
  });
});
