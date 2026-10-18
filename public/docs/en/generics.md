# Generics

TS Typed can validate values that pass through generic functions and generic classes. The key idea is that the compiler needs a **concrete type** to build a runtime contract, so coverage depends on how the type argument is written at the call site.

## Explicit type arguments

Calling a generic function, or constructing a generic class, **with an explicit type argument** validates both the arguments and the result against that concrete type for that call:

```ts
interface Person {
  name: string;
  age: number;
}

function identity<T>(x: T): T {
  return x;
}

identity<Person>(wrongShapedValue); // throws StrictTypeError, validated against Person

class Box<T> {
  constructor(public readonly value: T) {}
}

new Box<Person>(wrongShapedValue); // same, for constructors
```

In both cases, the value is checked against `Person` at the boundary. If it does not match, a `StrictTypeError` is thrown before the value reaches the function body or the object's fields.

## Async return values

The same check applies to the resolved value of an async function. Because the compiler validates it through `.then()`, the call still returns a Promise, and a failed check rejects that Promise:

```ts
async function identityAsync<T>(x: T): Promise<T> {
  return x;
}

const person = await identityAsync<Person>(wrongShapedValue); // rejects with StrictTypeError
```

## Rest parameters and spread arguments

Values that land in a rest parameter are validated too, including values supplied through spread syntax:

```ts
function collect<T>(...items: T[]): T[] {
  return items;
}

collect<number>(1, 2, 'bad'); // throws StrictTypeError on 'bad'

const mixed: unknown[] = [1, 2, 'bad'];
collect<number>(...mixed); // same check, applied to the spread values
```

## Inferred type arguments are not covered

> **Not covered: inferred type arguments.** When you omit the explicit `<T>` and let TypeScript infer the type, TS Typed does not validate the call:
>
> ```ts
> identity(wrongShapedValue); // no runtime check: T is inferred, not written out
> ```
>
> Supporting this would mean replicating the compiler's own type inference at every call site. That is a separate and considerably harder problem, and it is outside the current scope. If you want a runtime check on a generic call, write the type argument explicitly.

Generators are also not covered. Calling a generator function produces an iterator rather than a single return value, and the yielded values are not validated.

For the complete list of boundaries in this area, see [Limitations](./limitations.md).
