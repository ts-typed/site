# Performance e benchmarks

Os números abaixo são referências locais, não SLA. A bateria roda Node 22.22.3
com 7 amostras após 2 warmups, sempre comparando o mesmo fixture baseline
(`tsc`) e typed (`ts-typed build`).

| Cenário | Sem TS Typed | Com TS Typed | Impacto |
| --- | ---: | ---: | ---: |
| Express, 1 usuário | 0,811 ms | 0,650 ms | ruído local |
| Express, 50 usuários | 0,481 ms | 3,473 ms | 7,2x |
| Express, 10.000 usuários | 5,455 ms | 311,306 ms | 57,1x |
| Express, 10.000 + `TTOptImmut` | 5,455 ms | 198,085 ms | 1,57x melhor que typed normal |
| CSV, 1.000 linhas | 0,493 ms | 21,919 ms | 44,5x |
| CSV, 10.000 linhas | 3,758 ms | 201,496 ms | 53,6x |
| CSV, 50.000 linhas | 18,267 ms | 1.142,554 ms | 62,5x |

O Express remove `passwordHash` antes de responder e valida `Email`. O script
CSV faz parse, normaliza e rejeita e-mails inválidos. O resultado seguro sempre
é verificado para garantir que o campo secreto não voltou à resposta.

## Como reproduzir

```bash
node benchmarks/exhaustive-battery.cjs
```

Para 10.000 entidades com TypeORM, Express e NestJS, use também o harness em
`benchmarks/performance`. Em produção, pagine antes de retornar milhares de
itens; o tamanho do lote é o maior multiplicador do custo.

## Como interpretar

`protectValue` mantém valores mutáveis seguros e paga por accessors e por
travessias repetidas. `TTOptImmut<T>` valida e congela POJOs novos; por isso é
mais rápido em DTOs de saída somente leitura, mas não serve para entities,
classes ou objetos com accessors. Em pipelines CSV, reduza cópias intermediárias,
use lotes/streaming e meça parse, validação e escrita separadamente.
