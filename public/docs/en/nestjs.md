# NestJS Integration

The **`@ts-typed/nestjs`** package connects [`@ts-typed/compiler`](./core-concepts.md) to NestJS. When a typed boundary detects a contract violation, it throws a `StrictTypeError`. This package turns that error into an HTTP response with a sensible status code, a clear message, and the diagnostic details your clients need.

It also gives you a per-field escape hatch for custom messages and statuses, which covers much of what `class-validator` is normally used for.

## Installation

```bash
npm install @ts-typed/nestjs
```

## Setting up the filter

`StrictTypeErrorFilter` is a standard Nest exception filter. Register it globally to cover your whole application:

```ts
import { NestFactory } from '@nestjs/core';
import { StrictTypeErrorFilter } from '@ts-typed/nestjs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new StrictTypeErrorFilter());

  await app.listen(3000);
}
bootstrap();
```

You can also scope it to a single controller or handler:

```ts
import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { StrictTypeErrorFilter } from '@ts-typed/nestjs';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseFilters(StrictTypeErrorFilter)
export class UsersController {
  @Post()
  public create(@Body() dto: CreateUserDto) {
    // dto is already validated by TS Typed at this boundary
    return { ok: true };
  }
}
```

> **Note:** `@ts-typed/nestjs` does not replace Nest's own validation pipes and does not instantiate your DTOs. It only reacts to a `StrictTypeError` that TS Typed's instrumented code has already thrown. That error can come from a DTO field, a provider's return value, an Entity read back from the database, or any other place where a typed boundary exists.

## How the status code is decided

`StrictTypeErrorFilter` chooses the HTTP status code for a `StrictTypeError` by checking the following rules in order. The first rule that matches wins.

1. **An explicit `TypeErrorResponse()` on the violated field.** The field's own status is used, or `400` if none was given. A developer who decorated a field has already decided how its violation should look to the client, so this rule always takes precedence.
2. **A server fault, which returns `500`.** This applies when any of the following is true:
   - The violation's `operation` is `return` or `resolve`. This means the function or method's own body produced a bad value, for example a mapper that reads a corrupted row.
   - Its `contractKind` is `variable`. This covers a plain local variable, such as `const entity = await repo.findOneBy(...)` picking up corrupted data. It is never the client-facing surface of a request.
   - The field belongs to a class marked with `@ServerPopulated()`.
3. **Otherwise, `400`.** The violation is client input, such as a bad DTO field or a bad `@Body()` or `@Param()` argument.

## `ServerPopulated()`: telling an Entity apart from a DTO

A class field looks the same whether it comes from a TypeORM Entity or a DTO. An Entity reads corrupted data back from the database, which is a server fault. A DTO is populated by `class-transformer` from client input, which is a client fault. Both go through the exact same validation path, so TS Typed needs a hint to tell them apart.

Mark your Entity classes with `@ServerPopulated()`:

```ts
import { ServerPopulated } from '@ts-typed/nestjs'; // re-exported from @ts-typed/compiler
import { Entity, Column } from 'typeorm';

@Entity({ name: 'todos' })
@ServerPopulated()
export class TodoEntity {
  @Column({ type: 'varchar', enum: TodoStatus })
  public status!: TodoStatus;
}
```

With this decorator in place, a corrupted `status` value read back from the database responds with `500`. The same kind of violation on an unmarked DTO still responds with `400`.

## `TypeErrorResponse()`: a per-field alternative to class-validator

`@TypeErrorResponse()` lets you customize the message and, optionally, the status code of a single field:

```ts
import { TypeErrorResponse } from '@ts-typed/nestjs'; // re-exported from @ts-typed/compiler

export class CreateUserDto {
  @TypeErrorResponse('Invalid email', 422)
  public readonly email!: string;

  @TypeErrorResponse('Name must be between 2 and 100 characters')
  public readonly name!: string; // no status given -> defaults to 400
}
```

The decorator fires for **any** kind of violation on that field, including a wrong type, an extra property, or a write to a readonly field. It replaces only the `message` (and the `statusCode`, if you pass one). Every other diagnostic field still reaches the client, including `code`, `propertyPath`, `expected`, `received`, `contractKind`, and `operation`. The client gets your custom message and the full detail of what was wrong.

Like the rest of TS Typed, this is a single-violation mechanism — pair it with `AggregateErrors()` below if you also need every violation in one response.

## `AggregateErrors()`: collecting every violation in one response

Decorate a DTO with `AggregateErrors()` (from `@ts-typed/compiler`) to collect every violation found in it — at any depth, including nested objects and an optional/nullable nested DTO — into one `AggregateStrictTypeError`, instead of TS Typed's default fail-fast behavior:

```ts
import { AggregateErrors } from '@ts-typed/compiler';

@AggregateErrors()
export class CreateUserDto {
  public name: string = '';
  public age: number = 0;
}
```

No change is needed to `StrictTypeErrorFilter` or `StrictTypeHttpError`: `AggregateStrictTypeError extends StrictTypeError`, so the filter's existing `@Catch(StrictTypeError)` already catches it, and its `errors` array — every collected violation — is already included in the response body through the same `toJSON()`-spreading the filter always did.

**This only takes effect when TS Typed is validating the incoming value structurally, as a plain object, at the parameter boundary** — the shape a request body has by default with no `ValidationPipe`, or with one configured `transform: false`. If your app uses Nest's own recommended `ValidationPipe({ transform: true })`, `class-transformer`'s `plainToInstance` constructs the DTO and assigns each field one at a time *before* your handler — and TS Typed's own per-field guard, which protects every class field unconditionally, throws on the very first bad field during that construction. By the time a value would reach the parameter boundary `AggregateErrors()` governs, either the first bad field has already thrown (as an ordinary single-violation `StrictTypeError`, handled the same way as any other field violation above), or every field was already individually valid and there is nothing left to aggregate. See [Limitations](./limitations.md) for the full statement of this boundary.

## `StrictTypeHttpError`: build your own filter

`StrictTypeErrorFilter` is the batteries-included option. When you need custom handling, such as logging, a different response shape, or internationalization, use `StrictTypeHttpError` instead. It exposes the same status and message mapping as a reusable building block.

```ts
import { Catch } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { StrictTypeError } from '@ts-typed/compiler';
import { StrictTypeHttpError } from '@ts-typed/nestjs';

@Catch(StrictTypeError)
export class MyOwnFilter implements ExceptionFilter {
  catch(exception: StrictTypeError, host: ArgumentsHost): void {
    const httpError = StrictTypeHttpError.fromStrictTypeError(exception);

    // httpError.getStatus()   -> the resolved status code
    // httpError.getResponse() -> { statusCode, message, code, propertyPath, expected, received, contractKind, operation, ... }
    // httpError.cause         -> the original StrictTypeError, if you need anything not in the body above

    myLogger.warn('validation failed', { path: httpError.cause.propertyPath });

    const response = host.switchToHttp().getResponse();
    response.status(httpError.getStatus()).json({
      ok: false,
      reason: httpError.getResponse().message,
    });
  }
}
```

`StrictTypeHttpError` is a real Nest `HttpException` subclass. Anything else in your stack that already knows how to render an `HttpException`, such as Nest's default exception handling or Swagger's error schema tooling, understands it without special cases.

## Example response bodies

The following examples show what the client receives in each case. In none of them does the response include the raw value that failed validation or a stack trace.

**A DTO field without any decorator, with a plain type mismatch:**

```json
{
  "statusCode": 400,
  "message": "CreateUserDto.age expected number, received string",
  "code": "TYPE_MISMATCH",
  "propertyPath": "CreateUserDto.age",
  "expected": "number",
  "received": "string",
  "contractKind": "property",
  "operation": "initialize"
}
```

**The same field, decorated with `@TypeErrorResponse('Invalid age', 422)`:**

```json
{
  "statusCode": 422,
  "message": "Invalid age",
  "code": "TYPE_MISMATCH",
  "propertyPath": "CreateUserDto.age",
  "expected": "number",
  "received": "string",
  "contractKind": "property",
  "operation": "initialize"
}
```

**A `@ServerPopulated()` Entity field with corrupted data:**

```json
{
  "statusCode": 500,
  "message": "TodoEntity.status expected TodoStatus, received string",
  "code": "TYPE_MISMATCH",
  "propertyPath": "TodoEntity.status",
  "expected": "TodoStatus",
  "received": "string",
  "contractKind": "property",
  "operation": "initialize"
}
```

**A `@AggregateErrors()` DTO, validated structurally (no `ValidationPipe`, or `transform: false`), with two bad fields:**

```json
{
  "statusCode": 400,
  "message": "Validation failed: 2 error(s)",
  "code": "TYPE_MISMATCH",
  "propertyPath": "CreateUserDto.name",
  "expected": "string",
  "received": "number",
  "contractKind": "parameter",
  "operation": "argument",
  "errors": [
    {
      "code": "TYPE_MISMATCH",
      "propertyPath": "CreateUserDto.name",
      "expected": "string",
      "received": "number",
      "contractKind": "parameter",
      "operation": "argument"
    },
    {
      "code": "TYPE_MISMATCH",
      "propertyPath": "CreateUserDto.age",
      "expected": "number",
      "received": "string",
      "contractKind": "parameter",
      "operation": "argument"
    }
  ]
}
```

The top-level fields (`code`, `propertyPath`, `expected`, `received`, …) mirror the first violation, for any code that only knows about plain `StrictTypeError` fields. `errors` carries every violation found, in traversal order.

## One violation per request, unless you opt into `AggregateErrors()`

By default, TS Typed does not aggregate violations into a single response — it validates field by field and throws on the **first** invalid field, as the single-violation examples above show. [`AggregateErrors()`](#aggregateerrors-collecting-every-violation-in-one-response) opts a class into the aggregate model instead, scoped to the parameter boundary, with the `ValidationPipe({ transform: true })` caveat described above. `@TypeErrorResponse()` and `@ServerPopulated()` solve two different problems — customizing the message and status of a field, and telling Entities apart from DTOs — and remain single-violation mechanisms regardless of `AggregateErrors()`.
