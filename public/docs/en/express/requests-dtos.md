# Express: requests and DTOs

Express parses JSON but does not validate it. Give `request.body` a named DTO at the controller boundary and keep it separate from the database entity:

```ts
interface CreateUserRequest { name: string; email: string }
app.post('/users', (request, response) => {
  const input: CreateUserRequest = request.body;
  response.status(201).json(createUser(input));
});
```

TS Typed rejects wrong or extra fields at the instrumented call. `express.json()` must run before the route so the boundary receives the parsed value.
