# Decoradores

O TS Typed oferece um pequeno conjunto de decoradores que ajustam a forma como o compilador valida uma classe ou uma propriedade. Todos são importados de `@ts-typed/compiler`:

```ts
import {
  AllowExtraProperties,
  StrictClass,
  StructuralClass,
  ServerPopulated,
  TypeErrorResponse,
} from '@ts-typed/compiler';
```

Cada decorador sobrescreve um padrão para um único alvo. As configurações globais em `typets.config.json` continuam valendo para todo o resto.

### `AllowExtraProperties()`

`AllowExtraProperties()` é um decorador de classe ou de propriedade. Ele permite propriedades extras, não declaradas, na classe decorada ou no valor de uma propriedade decorada. É a sobrescrita, por alvo, da flag global `allowExtraPropertiesAll`.

```ts
@AllowExtraProperties()
class LooseConfig {
  public readonly host!: string;
  // Chaves adicionais são aceitas e mantidas.
}
```

Use-o em objetos que carregam dados extras de forma intencional, como blobs de configuração ou payloads de terceiros que você só aproveita em parte. Nos demais casos, mantenha o comportamento estrito padrão, para que chaves inesperadas sejam reportadas.

### `StrictClass()` / `StructuralClass()`

São decoradores de classe que controlam como valores tipados por classe são verificados em uma fronteira:

- **`StrictClass()`** força a validação **nominal**. Um valor só passa se for uma instância real da classe (`instanceof`).
- **`StructuralClass()`** força a validação **estrutural**. Um valor passa se seu formato corresponder à classe, independentemente da cadeia de protótipos.

Ambos sobrescrevem o padrão global `compiler.strictClass` apenas para aquela classe, qualquer que seja o padrão configurado. Subclasses herdam a configuração da classe pai, a menos que declarem a sua própria.

```ts
@StrictClass()
class Money {
  public readonly amount!: number;
  public readonly currency!: string;
}

@StructuralClass()
class Point {
  public readonly x!: number;
  public readonly y!: number;
}
```

### `ServerPopulated()`

`ServerPopulated()` é um decorador de classe que marca uma classe cujas instâncias são preenchidas pelo servidor ou pelo banco de dados, e não pela entrada do cliente. O uso previsto é uma classe `@Entity()` do TypeORM.

Quando um campo de uma classe `ServerPopulated` falha na validação, o `StrictTypeError` carrega `isServerPopulated: true`. Essa flag nunca aparece em `toJSON()`. Ela é a metade do lado do compilador que permite distinguir um campo corrompido em uma Entity de uma entrada inválida em um DTO: um campo de Entity que falha indica um problema do lado do servidor, enquanto um campo de DTO que falha costuma ser culpa do cliente.

```ts
import { Entity } from 'typeorm';
import { ServerPopulated } from '@ts-typed/compiler';

@Entity({ name: 'todos' })
@ServerPopulated()
export class TodoEntity {
  // ...colunas e campos
}
```

No lado do NestJS, o `StrictTypeErrorFilter` do `@ts-typed/nestjs` lê essa flag e responde com HTTP `500` em vez de `400`, de modo que um problema interno de dados não seja reportado ao cliente como uma requisição inválida.

### `TypeErrorResponse(message, status?)`

`TypeErrorResponse` é um decorador de propriedade. Ele associa uma mensagem personalizada, voltada ao HTTP, e um código de status opcional a um campo específico:

```ts
import { TypeErrorResponse } from '@ts-typed/compiler';

export class CreateUserDto {
  @TypeErrorResponse('Invalid email', 422)
  public readonly email!: string;
}
```

Quando um `StrictTypeError` é lançado para esse campo, ele carrega `typeErrorResponseMessage` e `typeErrorResponseStatus`. Assim como a flag de `ServerPopulated`, essas propriedades nunca são incluídas em `toJSON()`.

Por si só, este pacote não tem nenhuma noção de HTTP. Quem transforma esses campos em uma resposta HTTP de fato são o `StrictTypeErrorFilter` e o `StrictTypeHttpError` do `@ts-typed/nestjs`. Pense no `TypeErrorResponse` como uma alternativa, por propriedade, às mensagens que você escreveria com class-validator.

**Importante:** o `TypeErrorResponse` continua sendo um mecanismo de falha rápida (fail-fast). Ele personaliza a resposta para a **única** violação que disparar naquela propriedade. Não é um agregado de todas as violações do objeto. Se você precisar reportar todas as violações em uma única resposta, veja [Limitações](./limitations.md).
