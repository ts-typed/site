# TypeScript: requests and DTOs

Use a named interface or class for each external request. Keep the request DTO narrow and map it to a domain type before business logic.

```ts
export interface UpdateProfileRequest { displayName: string; bio?: string }
export function updateProfile(request: UpdateProfileRequest): void {
  // request is checked at the instrumented boundary
}
```

An incorrect primitive, missing required field, or undeclared property raises `StrictTypeError`. Optional properties may be omitted; `null` is distinct from `undefined` unless the type includes it.
