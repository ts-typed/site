import { getNavigationItems } from './docs-catalog';

export type DocSection = ReturnType<typeof getNavigationItems>[number];
export const DOC_SECTIONS: readonly DocSection[] = getNavigationItems();
