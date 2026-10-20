# Optimizations

## Fast immutable DTOs with `TTOptImmut<T>`

Use `TTOptImmut<T>` when a response is made of fresh POJOs and arrays and must
be read-only after validation.

```ts
import type { TTOptImmut } from '@ts-typed/compiler';

interface IUserData { id: number; name: string; email: string; }
type UsersResponse = TTOptImmut<IUserData[]>;
```

The compiler validates the whole batch and then deeply freezes it. This keeps
`Object.keys`, spread, JSON, and `structuredClone` compatible with ordinary
POJOs while avoiding a getter/setter pair for every field. The editor also sees
both the array and each DTO as `readonly`.

Prefer `TTOptImmut<IUserData[]>`: it makes the array and its items immutable.
`TTOptImmut<IUserData>[]` only makes the items immutable.

Do not use it for entities, classes, `Date`, `Map`, `Set`, functions,
accessor-backed objects, dynamic indexes, unions, or intersections. Those
cases receive an explicit diagnostic and should use normal protection.

In the local 10,000-response benchmark, `project + protectValue` had a 44.83
ms median; `project + TTOptImmut` took 10.58 ms (4.2x faster). Validation still
happens before freezing. See [Performance & Benchmarks](./performance.md) for
method, charts, and HTTP scenarios.
