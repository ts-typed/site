# Performance & benchmarks

These are local references, not an SLA. The battery uses Node 22.22.3 with 7
samples after 2 warmups, comparing the same fixture compiled by plain `tsc`
(baseline) and `ts-typed build` (typed).

| Scenario | Without TS Typed | With TS Typed | Impact |
| --- | ---: | ---: | ---: |
| Express, 1 user | 0.811 ms | 0.650 ms | local noise |
| Express, 50 users | 0.481 ms | 3.473 ms | 7.2x |
| Express, 10,000 users | 5.455 ms | 311.306 ms | 57.1x |
| Express, 10,000 + `TTOptImmut` | 5.455 ms | 198.085 ms | 1.57x better than normal typed |
| CSV, 1,000 rows | 0.493 ms | 21.919 ms | 44.5x |
| CSV, 10,000 rows | 3.758 ms | 201.496 ms | 53.6x |
| CSV, 50,000 rows | 18.267 ms | 1,142.554 ms | 62.5x |

Express removes `passwordHash` before responding and validates `Email`. The CSV
script parses, normalizes, and rejects invalid email rows. Every safe result is
checked to ensure the secret field is absent.

## Reproduce

```bash
node benchmarks/exhaustive-battery.cjs
```

For the 10,000-entity TypeORM/Express/NestJS stress case, also run the harness
in `benchmarks/performance`. In production, paginate before returning thousands
of items; batch size is the largest cost multiplier.

## Interpretation

`protectValue` keeps mutable values safe and pays for accessors and repeated
traversals. `TTOptImmut<T>` validates and freezes fresh POJOs, so it is faster
for read-only output DTOs but is not suitable for entities, classes, or accessor
objects. For large CSV pipelines, reduce intermediate copies, use batching or
streaming, and measure parsing, validation, and writing separately.
