# NestJS: responses

Annotate controller and provider returns with a public response DTO. Map entities before returning them:

```ts
interface UserResponse { id: string; name: string }
getOne(): UserResponse { return { id: this.user.id, name: this.user.name }; }
```

This prevents `passwordHash` and other internal fields from crossing the HTTP boundary. For large arrays, validate a public projection and consider `TTOptImmut`; measure with the [Benchmarks](../benchmarks.md) method.
