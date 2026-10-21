# Express: introduction

Express does not know TypeScript types at runtime. TS Typed instruments typed controller and service boundaries, while `@ts-typed/express` converts `StrictTypeError` into a safe HTTP response.

Keep transport concerns in the route and business contracts in named request and response types. This makes the same DTO usable by tests and services.
