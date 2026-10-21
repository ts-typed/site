# TypeScript: errors

Every violation is a `StrictTypeError`, a `TypeError` subclass. Handle it at the application boundary and avoid exposing raw values or stack traces.

```ts
try { createUser({ name: 'Ana', age: '30' }); }
catch (error: unknown) {
  if (error instanceof StrictTypeError) console.error(error.code, error.propertyPath);
  else throw error;
}
```

The common codes are `TYPE_MISMATCH`, `REQUIRED_PROPERTY`, `EXTRA_PROPERTY`, `READONLY_PROPERTY`, and `INVALID_MUTATION`. Their fields and safe handling are defined in [Core Concepts](../core-concepts.md).
