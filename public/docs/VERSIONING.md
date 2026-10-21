# Documentation versioning

The documentation line follows `major.minor`, never patch. The `0.1` line is the current default and documents the latest `0.1.x` releases of `@ts-typed/core`, `@ts-typed/nestjs`, and `@ts-typed/validators`.

When a package reaches a new minor or major line, add that line to `src/app/docs-versions.ts`, preserve the existing line, set its `directory`, and add version-specific content under `public/docs/<line>/<language>/`. Patch releases update the current line only. The three package pages share the selected documentation line, so compiler, NestJS, and validators stay aligned without pretending that patch releases are separate documentation versions.
