# Express: configuration

Express uses the same root `typets.config.json` as plain TypeScript. Run `npx ts-typed init` and keep the application entry point inside the compiler's TypeScript program. The emitted directory is the only directory that should run in production.

Use the global [Configuration](../configuration.md) for option semantics. Do not add a guessed Express CLI flag: the confirmed workflow is `init` followed by `build`.
