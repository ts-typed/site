# Decorators

TS Typed ships a small set of decorators that adjust how the compiler validates a class or a property. Every decorator is imported from `@ts-typed/compiler`:

```ts
import {
  AllowExtraProperties,
  StrictClass,
  StructuralClass,
  ServerPopulated,
  TypeErrorResponse,
} from '@ts-typed/compiler';
```

Each decorator overrides a default for a single target. The global settings in `typets.config.json` still apply everywhere else.

### `AllowExtraProperties()`

`AllowExtraProperties()` is a class or property decorator. It allows extra, undeclared properties on the decorated class, or on the value of one decorated property. It is the per-target override of the global `allowExtraPropertiesAll` flag.

```ts
@AllowExtraProperties()
class LooseConfig {
  public readonly host!: string;
  // Any additional keys are accepted and kept.
}
```

Use it for objects that intentionally carry extra data, such as configuration blobs or third-party payloads you only partially care about. Everywhere else, keep the default strict behavior so that unexpected keys are reported.

### `StrictClass()` / `StructuralClass()`

These are class decorators that control how class-typed values are checked at a boundary:

- **`StrictClass()`** forces **nominal** validation. A value passes only if it is an actual instance of the class (`instanceof`).
- **`StructuralClass()`** forces **structural** validation. A value passes if its shape matches the class, whatever its prototype chain.

Both override the global `compiler.strictClass` default for that one class, whichever way the default is set. Subclasses inherit the setting from their parent unless they declare their own.

```ts
@StrictClass()
class Money {
  public readonly amount!: number;
  public readonly currency!: string;
}

@StructuralClass()
class Point {
  public readonly x!: number;
  public readonly y!: number;
}
```

### `ServerPopulated()`

`ServerPopulated()` is a class decorator that marks a class whose instances are filled in by the server or the database, not by client input. The intended use is a TypeORM `@Entity()` class.

When a field of a `ServerPopulated` class fails validation, the `StrictTypeError` carries `isServerPopulated: true`. That flag is never included in `toJSON()`. It is the compiler-side half of telling a corrupted field in an Entity apart from bad input in a DTO: a failing Entity field is a server-side problem, while a failing DTO field is the client's fault.

```ts
import { Entity } from 'typeorm';
import { ServerPopulated } from '@ts-typed/compiler';

@Entity({ name: 'todos' })
@ServerPopulated()
export class TodoEntity {
  // ...columns and fields
}
```

On the NestJS side, `@ts-typed/nestjs`'s `StrictTypeErrorFilter` reads this flag and answers with HTTP `500` instead of `400`, so an internal data problem is not reported to the client as a bad request.

### `TypeErrorResponse(message, status?)`

`TypeErrorResponse` is a property decorator. It attaches a custom, HTTP-facing message and an optional status code to a specific field:

```ts
import { TypeErrorResponse } from '@ts-typed/compiler';

export class CreateUserDto {
  @TypeErrorResponse('Invalid email', 422)
  public readonly email!: string;
}
```

When a `StrictTypeError` is thrown for that field, it carries `typeErrorResponseMessage` and `typeErrorResponseStatus`. Like the `ServerPopulated` flag, these properties are never included in `toJSON()`.

On its own, this package has no HTTP awareness. `@ts-typed/nestjs`'s `StrictTypeErrorFilter` and `StrictTypeHttpError` are what turn these fields into an actual HTTP response. Think of `TypeErrorResponse` as a per-property alternative to the messages you would otherwise write with class-validator.

**Important:** `TypeErrorResponse` is still a fail-fast mechanism. It customizes the response for whichever **one** violation fires on that property. It is not an aggregate of every violation across the object. If you need to report all violations in one response, see [Limitations](./limitations.md).
