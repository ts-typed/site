# TypeScript: erros

Violações de contrato lançam `StrictTypeError`, uma subclasse de `TypeError`. Capture-o na borda do processo e use apenas o diagnóstico seguro:

```ts
import { StrictTypeError } from '@ts-typed/core';

try {
  await runJob();
} catch (error) {
  if (error instanceof StrictTypeError) {
    logger.warn({ validation: error.toJSON() }, 'contract violation');
    process.exitCode = 1;
  } else {
    throw error;
  }
}
```

`toJSON()` expõe `code`, `propertyPath`, `expected`, `received`, `contractKind`, `operation` e, quando existir, nomes de classe/função. Ele nunca inclui o valor bruto recusado ou stack trace; por isso é a forma apropriada para logs estruturados e respostas externas. Não serialize a exceção inteira.

Os códigos usuais são `TYPE_MISMATCH`, `REQUIRED_PROPERTY`, `EXTRA_PROPERTY`, `READONLY_PROPERTY` e `INVALID_MUTATION`. `contractKind` e `operation` explicam a origem: parâmetro tende a ser entrada; `return`, `resolve` ou variável interna normalmente apontam bug, mapper incorreto ou dado persistido corrompido.

```ts
import { AggregateStrictTypeError, StrictTypeError } from '@ts-typed/core';

function report(error: unknown): unknown {
  if (error instanceof AggregateStrictTypeError) {
    return { error: error.toJSON(), errors: error.errors.map((item) => item.toJSON()) };
  }
  if (error instanceof StrictTypeError) return error.toJSON();
  throw error;
}
```

Não converta exceções desconhecidas em erro de validação; preserve a diferença entre entrada inválida e defeito do serviço. Leia [Erros](../errors.md) e [Requisições e DTOs](./requests-dtos.md).
