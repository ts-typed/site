# Getting Started

This page walks you through installing TS Typed, generating its configuration, and running your first build. The whole process takes a few minutes.

## Prerequisites

TS Typed works on top of a normal TypeScript project. You need Node.js and a project that already compiles with `tsc`.

## Step 1: Install the compiler

Add `@ts-typed/core` as a development dependency:

```bash
npm install --save-dev @ts-typed/core
```

The compiler is a build-time tool. Your application code does not change its runtime dependencies because of it.

## Step 2: Initialize the configuration

Run the `init` command from the root of your project:

```bash
npx ts-typed init
```

This creates a `typets.config.json` file in the current project. It holds the settings the compiler uses, such as the output directory and the compiler flags described in the rest of these docs.

## Step 3: Build the project

Run the transform:

```bash
npx ts-typed build
```

The build walks your TypeScript project with the real type checker, inserts runtime checks at every typed boundary, and emits the instrumented project to `outDir`. The `outDir` setting in `typets.config.json` controls where that output goes. Run your application from the emitted output, not from your original source files, so the checks are active.

## A minimal example

Write a normal TypeScript class. Nothing else is required:

```ts
// src/users/create-user.dto.ts
export class CreateUserDto {
  public name!: string;
  public age!: number;
  public isActive!: boolean;
}
```

Then use it in a function:

```ts
// src/users/users.service.ts
import { CreateUserDto } from './create-user.dto';

export function createUser(dto: CreateUserDto) {
  return { id: crypto.randomUUID(), ...dto };
}
```

### What you write

You wrote types. That is the entire contract, and there is no schema to keep in sync with it.

### What gets checked

After `ts-typed build`, the parameter `dto` is a typed boundary. The compiler inserts a check built from `CreateUserDto` at that point, so the following calls behave as described:

```ts
createUser({ name: 'Ana', age: 30, isActive: true }); // passes

createUser({ name: 'Ana', age: '30', isActive: true });
// throws StrictTypeError: TYPE_MISMATCH at CreateUserDto.age
```

The check also rejects extra properties. An object with a field that `CreateUserDto` does not declare fails with `EXTRA_PROPERTY`. Core Concepts explains each error code in detail.

## Next steps

- Read [Core Concepts](./core-concepts.md) to learn what a typed boundary is and what gets checked.
- Read [Value Object](./value-object.md) to build validated domain types that are constructed automatically.
