# Express: practices and examples

```ts
app.get('/users/:id', async (request, response, next) => {
  try {
    const row = await users.findById(request.params.id);
    if (!row) return response.sendStatus(404);
    const body: UserResponse = { id: row.id, name: row.name };
    return response.json(body);
  } catch (error: unknown) { return next(error); }
});
```

Keep the adapter last, map entities to public DTOs, use pagination, and run only emitted output. Test both valid payloads and `StrictTypeError` responses as HTTP behavior.
