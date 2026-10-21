# Express: responses

Declare the response DTO and map persistence data before calling `res.json`:

```ts
interface UserResponse { id: string; name: string }
function toResponse(row: { id: string; name: string; passwordHash: string }): UserResponse {
  return { id: row.id, name: row.name };
}
```

For collections, project public columns in the query where possible. `TTOptImmut` is useful for large public arrays; compare it with the mutable path in [Benchmarks](../benchmarks.md).
