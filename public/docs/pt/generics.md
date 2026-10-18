# Genéricos

O TS Typed consegue validar valores que atravessam funções genéricas e classes genéricas. A ideia central é que o compilador precisa de um **tipo concreto** para montar um contrato em tempo de execução, então a cobertura depende de como o argumento de tipo é escrito no ponto de chamada.

## Argumentos de tipo explícitos

Chamar uma função genérica, ou construir uma classe genérica, **com um argumento de tipo explícito** valida tanto os argumentos quanto o resultado contra aquele tipo concreto, naquela chamada:

```ts
interface Person {
  name: string;
  age: number;
}

function identity<T>(x: T): T {
  return x;
}

identity<Person>(valorComFormatoErrado); // lança StrictTypeError, validado contra Person

class Box<T> {
  constructor(public readonly value: T) {}
}

new Box<Person>(valorComFormatoErrado); // o mesmo, para construtores
```

Nos dois casos, o valor é verificado contra `Person` na fronteira. Se não corresponder, um `StrictTypeError` é lançado antes que o valor chegue ao corpo da função ou aos campos do objeto.

## Valores de retorno assíncronos

A mesma verificação se aplica ao valor resolvido de uma função assíncrona. Como o compilador faz a validação via `.then()`, a chamada continua retornando uma Promise, e uma verificação que falha rejeita essa Promise:

```ts
async function identityAsync<T>(x: T): Promise<T> {
  return x;
}

const person = await identityAsync<Person>(valorComFormatoErrado); // rejeita com StrictTypeError
```

## Parâmetros rest e argumentos com spread

Valores que caem em um parâmetro rest também são validados, inclusive os valores fornecidos pela sintaxe de spread:

```ts
function collect<T>(...items: T[]): T[] {
  return items;
}

collect<number>(1, 2, 'bad'); // lança StrictTypeError em 'bad'

const misturados: unknown[] = [1, 2, 'bad'];
collect<number>(...misturados); // a mesma verificação, aplicada aos valores do spread
```

## Argumentos de tipo inferidos não são cobertos

> **Não coberto: argumentos de tipo inferidos.** Quando você omite o `<T>` explícito e deixa o TypeScript inferir o tipo, o TS Typed não valida a chamada:
>
> ```ts
> identity(valorComFormatoErrado); // sem verificação em tempo de execução: T é inferido, não escrito
> ```
>
> Dar suporte a isso significaria replicar a inferência de tipos do próprio compilador em cada ponto de chamada. É um problema separado, consideravelmente mais difícil, e está fora do escopo atual. Se você quer uma verificação em tempo de execução em uma chamada genérica, escreva o argumento de tipo explicitamente.

Geradores também não são cobertos. Chamar uma função geradora produz um iterador, e não um único valor de retorno, e os valores emitidos com `yield` não são validados.

Para a lista completa das fronteiras desta área, veja [Limitações](./limitations.md).
