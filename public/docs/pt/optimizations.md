# Otimizações

## DTOs imutáveis rápidos com `TTOptImmut<T>`

Use `TTOptImmut<T>` quando uma resposta é formada por POJOs e arrays novos e
deve ser somente leitura depois da validação.

```ts
import type { TTOptImmut } from '@ts-typed/compiler';

interface IUserData { id: number; name: string; email: string; }
type UsersResponse = TTOptImmut<IUserData[]>;
```

O compiler valida o lote inteiro e então o congela profundamente. Isso mantém
`Object.keys`, spread, JSON e `structuredClone` compatíveis com POJOs comuns,
mas evita instalar getters e setters em cada campo. O editor também entende que
o array e cada DTO são `readonly`.

Prefira `TTOptImmut<IUserData[]>`: ela torna o array e seus itens imutáveis.
`TTOptImmut<IUserData>[]` deixa apenas os itens imutáveis.

Não use em entities, classes, `Date`, `Map`, `Set`, funções, objetos com
accessors, índices dinâmicos, unions ou intersections. Esses casos recebem um
diagnóstico explícito e devem continuar com a proteção normal.

No benchmark local de 10.000 respostas, `project + protectValue` teve mediana
de 44,83 ms; `project + TTOptImmut` teve 10,58 ms (4,2x mais rápido). A
validação continua acontecendo antes do congelamento. Veja [Performance e
Benchmarks](./performance.md) para método, gráficos e cenários HTTP.
