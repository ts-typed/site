# Limitações

O TS Typed tem um escopo intencionalmente delimitado. As limitações abaixo são **fronteiras de escopo deliberadas, não descuidos**. Cada uma reflete uma escolha sobre o que o compilador promete e o que não promete, e esta página as lista de forma explícita para que você possa planejar em torno delas.

## Modelo de validação

- **Violações múltiplas não são agregadas.** O TS Typed valida e preenche um objeto campo a campo, e lança erro na primeira falha. Isso difere do modelo do class-validator, que preenche o objeto inteiro, valida tudo em uma única passagem e coleta cada violação. Se você precisar de todas as violações em uma única resposta, terá de manter, ou reintroduzir, esse tipo de validação agregada por conta própria.

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

---

Se alguma dessas limitações bloquear o seu caso de uso, o próximo passo geralmente é ajustar a fronteira: tornar o tipo explícito, importar a classe pelo nome ou manter uma etapa de validação própria onde o TS Typed não alcança. Para os mecanismos que cobrem essas áreas, veja [Decoradores](./decorators.md) e [Genéricos](./generics.md).
