# NestJS: errors

`StrictTypeErrorFilter` catches compiler violations and produces a safe status and body. Register it globally:

```ts
app.useGlobalFilters(new StrictTypeErrorFilter());
```

The response includes diagnostic fields such as `code` and `propertyPath` without the raw invalid value or stack trace. `AggregateErrors()` can collect nested violations; the filter handles its `errors` array because the aggregate error extends `StrictTypeError`. Confirm optional custom mapping against the installed adapter version.
