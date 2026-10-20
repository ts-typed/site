# Limitações

O TS Typed tem um escopo intencionalmente delimitado. As limitações abaixo são **fronteiras de escopo deliberadas, não descuidos**. Cada uma reflete uma escolha sobre o que o compilador promete e o que não promete, e esta página as lista de forma explícita para que você possa planejar em torno delas.

## Modelo de validação

- **Violações múltiplas não são agregadas por padrão.** Decorar uma classe com [`AggregateErrors()`](./decorators.md#aggregateerrors) faz ela coletá-las na fronteira de parâmetro, inclusive depois que o `class-transformer` preenche o DTO pelo `ValidationPipe({ transform: true })` do NestJS. Um DTO decorado aninhado também é drenado enquanto um objeto, array, tupla, `Map` ou `Set` que o contém é validado estruturalmente, portanto escritas rejeitadas não podem ser aceitas silenciosamente. As fronteiras restantes são deliberadas: um **parâmetro** do tipo array (`dtos: Dto[]`) continua fail-fast após o primeiro elemento inválido; uma chamada de decorator qualificada por namespace não é detectada; uma sobrescrita `TypeErrorResponse()` não entra nos campos herdados da primeira violação do agregado; e um campo `ValueObject` com entrada bruta inválida lança imediatamente em vez de entrar no agregado. Uma instância decorada que nunca cruza uma fronteira de parâmetro tipada mantém a janela de coleta aberta, então o recurso é apropriado apenas para DTOs recém-populados.

## Coleções

- **`WeakMap` e `WeakSet` não são suportados no nível do schema.** Não se trata apenas de uma lacuna em tempo de execução: eles não podem ser iterados, então não há o que validar em uma passagem pela fronteira.
- **Os guards de mutação cobrem apenas o que envolvem.** Um guard envolve o valor que cruza a fronteira e seus contêineres aninhados no momento em que é criado, e de novo sempre que um novo valor é escrito por meio dele. Alguns caminhos contornam o guard:
  - Uma referência bruta obtida antes da fronteira.
  - Os itens já existentes de um Set. Eles não podem ser trocados sem alterar a ordem de iteração.

## Genéricos

- **Classes e métodos genéricos sem forma de expressão de chamada não são cobertos.** Um valor genérico usado apenas como anotação de tipo, nunca de fato chamado ou construído, não dá ao compilador nenhum ponto de chamada do qual resolver uma assinatura instanciada.
- **Um método cuja declaração genérica vive em uma das bibliotecas embutidas do próprio TypeScript é excluído.** `Array.prototype.map`, `Promise.resolve`, os métodos do próprio `Map`/`Set`, o `new Map(...)`/`new Set(...)` em si, e assim por diante, estão deliberadamente fora do escopo — veja [Genéricos](./generics.md#o-que-ainda-não-é-coberto) para entender o motivo.
- **Geradores não são cobertos.** Chamar uma função geradora produz um iterador, e não um único valor de retorno, e os valores emitidos com `yield` não são validados.

## Saída de módulos

- **A saída AMD, UMD e System não é coberta pela guarda de `exports` do CommonJS.** A forma em lista `let x; export { x };` também não é coberta por essa guarda. O ESM não precisa de equivalente, porque os namespaces de módulo já são não graváveis por especificação.

## Detecção de `ValueObject`

- **Uma subclasse de `ValueObject` não é construída automaticamente quando é alcançada apenas por:**
  - inferência;
  - importação de namespace;
  - importação que não é nomeada explicitamente no arquivo que faz a resolução.
- **Uma união que inclui um tipo `ValueObject` não é construída automaticamente.** Por exemplo, `CPF | undefined` não é construído automaticamente.
- **Uma classe alcançada por uma instalação em `node_modules` via symlink ou workspace não é detectada.**

## Referência de desempenho

Os números a seguir são medições locais de referência, não um benchmark com banco remoto nem uma promessa de capacidade em produção. Foram coletados no Node 22.22.3, usando TypeORM e `better-sqlite3` em memória, com 10.000 instâncias de `UserEntity`. O formato da resposta remove `passwordHash`. Os resultados HTTP usam cinco amostras de 20 requisições cada, com concorrência 4.

Os microbenchmarks distinguem duas operações:

- `assertValue` valida um valor e relata violações; não cria um objeto de resposta protegido.
- `protectValue` projeta e protege o valor de resposta. A etapa de projeção está incluída no resultado `project+protectValue` abaixo.

Estas medições incluem o cache por travessia de chaves de schema em `WeakMap` do compiler 0.1.28. O cache é descartado ao final da validação/proteção; ele não enfraquece a proteção contra mutações nem retém schemas entre requisições.

| Operação | Mediana |
| --- | ---: |
| Validação de primitivo | 42,6 ns |
| Objeto `UserResponse` | 567 ns |
| `UserResponse[100]` | 42,7 µs |
| `assertValue(UserResponse[10k])` | 4,89 ms |
| `assertValue(UserEntity[10k])` | 5,93 ms |
| `project+protectValue(UserResponse[10k])` | 43,44 ms |

Em throughput HTTP, a linha de base sem proteção foi de 78,87 req/s com Express e 77,73 req/s com Nest. O caminho protegido mediu 15,79 req/s com Express e 15,85 req/s com Nest.

Esses números testam intencionalmente sob estresse um formato de resposta ruim em produção: retornar 10.000 usuários em uma única resposta. Em produção, prefira paginação (com tamanhos de página limitados) antes de otimizar esse caminho. Use os valores para comparar formatos e estratégias de proteção localmente, não como promessa para outro runtime, banco, rede ou implantação.

---

Se alguma dessas limitações bloquear o seu caso de uso, o próximo passo geralmente é ajustar a fronteira: tornar o tipo explícito, importar a classe pelo nome ou manter uma etapa de validação própria onde o TS Typed não alcança. Para os mecanismos que cobrem essas áreas, veja [Decoradores](./decorators.md) e [Genéricos](./generics.md).
