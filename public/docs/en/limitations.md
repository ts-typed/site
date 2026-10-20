# Limitations

TS Typed is intentionally scoped. The limitations below are **deliberate scope boundaries, not oversights**. Each one is a choice about what the compiler will and will not promise, and this page lists them plainly so you can plan around them.

## Validation model

- **Multiple violations are not aggregated by default.** Decorating a class with [`AggregateErrors()`](./decorators.md#aggregateerrors) opts it into collecting them at a parameter boundary, including after `class-transformer` populates the DTO through NestJS's `ValidationPipe({ transform: true })`. A decorated nested DTO is also drained while an enclosing object, array, tuple, `Map`, or `Set` is structurally checked, so rejected writes cannot be silently accepted. The remaining boundaries are deliberate: an array-typed **parameter itself** (`dtos: Dto[]`) remains fail-fast after its first bad element; a namespace-qualified decorator call is not detected; a `TypeErrorResponse()` override is not folded into the aggregate's inherited first-error fields; and a `ValueObject` field with invalid raw input throws immediately rather than joining the aggregate. A decorated instance that never reaches a typed parameter boundary keeps its collection window open, so it is only suitable for freshly populated DTOs.

## Collections

- **`WeakMap` and `WeakSet` are unsupported at the schema level.** This is not only a runtime gap. They cannot be iterated, so there is nothing to validate at a boundary crossing.
- **Mutation guards only cover what they wrap.** A guard wraps the boundary-crossing value and its nested containers at the moment the guard is created, and again whenever a new value is written through it. Some paths bypass the guard:
  - A raw reference taken before the boundary.
  - A Set's pre-existing items. They cannot be swapped out without changing iteration order.

## Generics

- **Generic classes and methods with no call-expression form are not covered.** A generic value used only as a type annotation, never actually called or constructed, gives the compiler no call site to resolve an instantiated signature from.
- **A method whose generic declaration lives in one of TypeScript's own bundled libraries is excluded.** `Array.prototype.map`, `Promise.resolve`, `Map`/`Set`'s own methods, `new Map(...)`/`new Set(...)` themselves, and so on, are deliberately out of scope — see [Generics](./generics.md#whats-still-not-covered) for why.
- **Generators are not covered.** Calling a generator function produces an iterator rather than a single return value, and the yielded values are not validated.

## Module output

- **AMD, UMD, and System module output are not covered by the CommonJS `exports` guard.** The `let x; export { x };` list form is also not covered by that guard. ESM needs no equivalent, because module namespace objects are already non-writable by specification.

## `ValueObject` detection

- **A `ValueObject` subclass is not auto-constructed when it is reached only through:**
  - inference;
  - a namespace import;
  - an import that is not named explicitly in the file doing the resolving.
- **A union that includes a `ValueObject` type does not auto-construct.** For example, `CPF | undefined` does not auto-construct.
- **A class reached through a symlinked or workspace `node_modules` install is not detected.**

## Performance reference

The following figures are local reference measurements, not a remote-database benchmark or a production capacity promise. They were collected on Node 22.22.3 with TypeORM and `better-sqlite3` in memory, using 10,000 `UserEntity` instances. The response shape removes `passwordHash`. The HTTP results use five samples of 20 requests each, with concurrency 4.

The microbenchmarks separate two operations:

- `assertValue` validates a value and reports violations; it does not create a protected response object.
- `protectValue` projects and protects the response value. The projection step is included in the `project+protectValue` result below.

| Operation | Median |
| --- | ---: |
| Primitive validation | 29.0 ns |
| `UserResponse` object | 536 ns |
| `UserResponse[100]` | 58.9 µs |
| `assertValue(UserResponse[10k])` | 6.20 ms |
| `assertValue(UserEntity[10k])` | 7.58 ms |
| `project+protectValue(UserResponse[10k])` | 47.1 ms |

For HTTP throughput, the unprotected baseline was 77.06 req/s with Express and 76.28 req/s with Nest. The protected path measured 14.59 req/s with Express and 14.41 req/s with Nest.

These numbers intentionally stress-test a bad production response shape: returning 10,000 users in one response. In production, prefer pagination (and bounded page sizes) before optimizing this path. Treat the figures as a way to compare shapes and protection strategies locally, not as a promise about another runtime, database, network, or deployment.

---

If one of these limitations blocks your use case, the right next step is usually to adjust the boundary: make the type explicit, import the class by name, or keep a validation step of your own where TS Typed does not reach. For the mechanisms that do cover these areas, see [Decorators](./decorators.md) and [Generics](./generics.md).
