# Express: errors

Install and register `@ts-typed/express` error middleware after all routes:

```ts
import { typedErrorHandler } from '@ts-typed/express';
app.use(typedErrorHandler());
```

The adapter maps a `StrictTypeError` to a safe status and JSON body. Unknown errors continue through Express's normal error chain. Do not send raw values or stack traces to clients. Custom status and message hooks are available in the adapter's confirmed API; verify the installed package version before relying on optional configuration.
