# Express: getting started

Install the compiler and Express, initialise the project, and emit the server:

```bash
npm install --save-dev @ts-typed/core
npm install express
npx ts-typed init
npx ts-typed build
```

Start the server from the emitted `outDir`. The integration package `@ts-typed/express` provides the error middleware described in [Errors](./errors.md). The exact production script is project-specific; verify CLI-dependent scripts before publishing.
