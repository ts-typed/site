# TypeScript: responses

Annotate return values with the public shape that callers are allowed to receive. Map internal entities instead of returning them directly:

```ts
interface UserResponse { id: string; email: string }
function toUserResponse(user: { id: string; email: string; passwordHash: string }): UserResponse {
  return { id: user.id, email: user.email };
}
```

For large lists, validate one public projection and prefer `TTOptImmut` where the installed compiler supports it. See [Optimizations](../optimizations.md) and [Benchmarks](../benchmarks.md).
