# NestJS: respostas

Publique uma projeção, nunca a entidade completa:

```ts
import type { TTOptImmut } from '@ts-typed/core';

interface UserResponse { id: string; name: string; email: string }

async function listUsers(): Promise<TTOptImmut<UserResponse[]>> {
  const rows = await repository.findAll();
  return rows.map(({ id, name, email }) => ({ id, name, email }));
}
```

O retorno instrumentado aponta mapper incompleto, tipo errado e resposta incompatível antes que o Nest a serialize. `TTOptImmut` é apropriado para um snapshot de arrays e objetos simples; ele valida e congela. Não serve para entity, `Date`, `Map`, `Set` ou accessors.

Quando o retorno/resolução async falha, `StrictTypeErrorFilter` responde `500`, pois é uma promessa quebrada pelo servidor. Para entidades de banco, marque a classe com `@ServerPopulated()`; um campo corrompido lido da persistência também será `500`, não um `400` atribuído ao cliente. Pagine, limite e projete antes de tentar reduzir custo de uma coleção gigantesca.
