# TypeScript: practices and examples

- Keep DTOs at I/O boundaries and domain types inside the service.
- Return public projections, never persistence entities containing secrets.
- Use one build output in development and production so checks are not accidentally bypassed.
- Paginate large collections and measure with your payload shape.

```ts
interface UserResponse { id: string; name: string }
export function listUsers(rows: readonly { id: string; name: string; passwordHash: string }[]): UserResponse[] {
  return rows.map(({ id, name }) => ({ id, name }));
}
```

This example keeps the response contract explicit and removes `passwordHash` before validation and serialization.
