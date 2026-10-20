export interface DocumentationVersion {
  readonly value: string;
  readonly label: string;
  readonly isLatest: boolean;
  readonly directory: string | undefined;
}

export const DOCUMENTATION_VERSIONS: readonly DocumentationVersion[] = [
  { value: '0.1', label: '0.1', isLatest: true, directory: undefined },
];

export const CURRENT_DOCUMENTATION_VERSION = DOCUMENTATION_VERSIONS[0].value;

export function getDocumentationVersion(value: string | null): DocumentationVersion {
  return DOCUMENTATION_VERSIONS.find((version) => version.value === value) ?? DOCUMENTATION_VERSIONS[0];
}
