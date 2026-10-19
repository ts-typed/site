# Limitations

TS Typed is intentionally scoped. The limitations below are **deliberate scope boundaries, not oversights**. Each one is a choice about what the compiler will and will not promise, and this page lists them plainly so you can plan around them.

## Validation model

- **Multiple violations are not aggregated by default.** TS Typed validates and populates an object field by field, and throws on the first bad field. Decorating a class with [`AggregateErrors()`](./decorators.md#aggregateerrors) opts it into collecting every violation instead — but only at the parameter boundary, and only when the value reaching that boundary is still a plain, not-yet-instantiated object. **It has no effect on a value that `class-transformer`'s `plainToInstance` already constructed field by field** — the default behind NestJS's `ValidationPipe({ transform: true })` — because TS Typed's own per-field guard throws on the first bad field *during that construction*, before the finished object would ever reach the parameter boundary this decorator governs. A per-field `TypeErrorResponse()` override is also not folded into an `AggregateStrictTypeError`'s own fields; only the first violation's fields are, through inheritance. An array-typed **parameter itself** (`dtos: Dto[]`, as opposed to a nested array field) is not aggregated, and a namespace-qualified decorator call (`@someNamespace.AggregateErrors()`) is not detected.

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

---

If one of these limitations blocks your use case, the right next step is usually to adjust the boundary: make the type explicit, import the class by name, or keep a validation step of your own where TS Typed does not reach. For the mechanisms that do cover these areas, see [Decorators](./decorators.md) and [Generics](./generics.md).
