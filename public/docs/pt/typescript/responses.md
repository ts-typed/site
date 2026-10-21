# TypeScript: respostas

Uma saída anotada protege o consumidor contra mappers, banco ou integrações que deixaram de produzir o formato prometido. Projete dados internos explicitamente; não devolva entidade e espere que `JSON.stringify` esconda segredos.

```ts
interface UserRow { id: string; name: string; email: string; passwordHash: string }
interface UserResponse { id: string; name: string; email: string }

export function toUserResponse(user: UserRow): UserResponse {
  return { id: user.id, name: user.name, email: user.email };
}
```

O retorno detecta campo obrigatório esquecido, tipo incorreto ou mapper incompatível. A projeção elimina `passwordHash` por design.

## Listas imutáveis com `TTOptImmut`

```ts
import type { TTOptImmut } from '@ts-typed/core';

interface ProductSummary { id: string; name: string; priceCents: number }

export function listProducts(rows: readonly ProductSummary[]): TTOptImmut<ProductSummary[]> {
  return rows.map(({ id, name, priceCents }) => ({ id, name, priceCents }));
}
```

`TTOptImmut` seleciona validação seguida de congelamento para snapshots formados por arrays e objetos simples. Não use com entidades, classes, `Date`, `Map`, `Set` ou accessors: esses formatos são rejeitados para não prometer imutabilidade que não existe. Pagine e projete antes de ajustar flags; `enforceMutationGuards` usa `Proxy`, muda identidade e custa por mutação.

Em `async`, o valor resolvido de `Promise<UserResponse>` é validado. Uma falha no mapper rejeita a promise e representa defeito do servidor, não erro do cliente. Veja [Otimizações](../optimizations.md) e [Benchmarks](../benchmarks.md).
