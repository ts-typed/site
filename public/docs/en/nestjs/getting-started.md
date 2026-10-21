# NestJS: getting started

Install the compiler and Nest adapter, then initialise the project:

```bash
npm install --save-dev @ts-typed/core @ts-typed/nestjs
npx ts-typed init
```

The confirmed compiler workflow is `npx ts-typed build`; the Nest script integration and builder details require final CLI verification. Use the TypeScript builder, emit to the configured directory, and run that output. Register `StrictTypeErrorFilter` as described in [Errors](./errors.md).
