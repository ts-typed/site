# TypeScript: implementation

Model the boundary directly in TypeScript and keep the implementation ordinary:

```ts
export interface CreateUserRequest { name: string; age: number }
export interface UserResponse { id: string; name: string }

export function createUser(request: CreateUserRequest): UserResponse {
  return { id: crypto.randomUUID(), name: request.name };
}
```

Build the project with `npx ts-typed build`, then call the emitted function. The parameter and return annotations are the runtime boundaries; no schema duplication is required.
