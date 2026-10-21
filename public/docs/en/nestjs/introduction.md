# NestJS: introduction

Nest controllers and providers are ordinary TypeScript boundaries. TS Typed checks DTO parameters and provider returns after compilation. `@ts-typed/nestjs` supplies an exception filter that turns `StrictTypeError` into safe HTTP output.

This complements, rather than replaces, Nest pipes: the filter handles violations already raised by instrumented code.
