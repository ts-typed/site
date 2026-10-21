# NestJS: requests and DTOs

Decorate a DTO as usual and type the controller parameter:

```ts
export class CreateUserDto { name!: string; email!: string; }

@Post()
create(@Body() body: CreateUserDto): UserResponse {
  return this.users.create(body);
}
```

TS Typed checks the typed boundary. `ValidationPipe` remains useful for Nest transformation and other validation; it does not replace the compiler's runtime contract. Keep DTOs separate from persistence entities.
