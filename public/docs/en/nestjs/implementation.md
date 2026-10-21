# NestJS: implementation

Register the filter globally so every controller shares one error policy:

```ts
import { StrictTypeErrorFilter } from '@ts-typed/nestjs';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new StrictTypeErrorFilter());
  await app.listen(3000);
}
```

Use the normal TypeScript builder and run the emitted application. The filter can also be scoped with `@UseFilters` when a route needs a local policy.
