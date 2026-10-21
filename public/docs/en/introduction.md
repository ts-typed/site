# Introduction

TS Typed turns the types you already write in TypeScript into runtime enforcement. Your declarations stop being comments that the compiler erases and become checks that run while your program runs.

## What is TS Typed?

TS Typed is a set of packages that work together:

- **@ts-typed/core** instruments your TypeScript project so runtime values are checked against the types the compiler already knows about.
- **@ts-typed/nestjs** integrates those checks into NestJS applications.
- **@ts-typed/validators** provides ready-made value objects, such as `Email`, that you can use directly in your types.

You write normal TypeScript. There are no schema definitions to maintain and no decorators required for the basics. A transform pass inserts the runtime checks for you, built from the exact type declared at each point in your code.

## The core idea

In most projects, the same contract is written twice: once as a TypeScript type for the compiler, and once as a schema for runtime validation. The two drift apart over time.

TS Typed removes the second copy. **The type you wrote is the contract.** If a value crosses a place where that type is declared and does not match it, the program throws instead of letting a malformed value flow silently into the rest of your code.

## From type to JavaScript

You write the type and ts-typed guarantees that it is applied.

```ts
interface User {
  id: number;
  name: string;
}

function loadUser(user: User) {
  return findUserById(user.id);
}
```

With `tsc`, interfaces disappear:

```js
function loadUser(user) {
  return findUserById(user.id);
}
```

With `ts-typed`, the generated JavaScript checks the contract before running the method:

```js
function loadUser(user) {
  if (typeof user.name !== 'string') throw new StrictTypeError('user.name');
  if (typeof user.id !== 'number') throw new StrictTypeError('user.id');
  return findUserById(user.id);
}
```

The generated snippet is simplified for readability; the compiler inserts the schema and protection automatically.

## Why not a schema library?

Consider a typical DTO validated with a decorator-based library:

```ts
// Duplicated: the type and the validation rules describe the same shape.
class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  age!: number;
}
```

With TS Typed, the declaration is the whole story:

```ts
export class CreateUserDto {
  public name!: string;
  public age!: number;
}
```

The compiler reads these types and inserts checks for them. When you add a field, you change one place. When you rename a field, the type checker and the runtime check agree, because they come from the same declaration.

## Where to go next

- Start with [Getting Started](./getting-started.md) to install the compiler and run your first build.
- Read [Core Concepts](./core-concepts.md) to understand typed boundaries, what gets checked, and how errors are reported.
- Read [Value Object](./value-object.md) to see how `ValueObject` types are constructed automatically from raw input.
