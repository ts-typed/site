# Integração com NestJS

O pacote **`@ts-typed/nestjs`** conecta o [`@ts-typed/compiler`](./core-concepts.md) ao NestJS. Quando uma fronteira tipada detecta uma violação de contrato, ela lança um `StrictTypeError`. Este pacote transforma esse erro em uma resposta HTTP com o status code adequado, uma mensagem clara e os detalhes de diagnóstico de que o cliente precisa.

Ele também oferece um mecanismo por campo para mensagens e status personalizados, o que cobre boa parte do que normalmente se faz com `class-validator`.

## Instalação

```bash
npm install @ts-typed/nestjs
```

## Configurando o filtro

`StrictTypeErrorFilter` é um filtro de exceções padrão do Nest. Registre-o globalmente para cobrir toda a aplicação:

```ts
import { NestFactory } from '@nestjs/core';
import { StrictTypeErrorFilter } from '@ts-typed/nestjs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new StrictTypeErrorFilter());

  await app.listen(3000);
}
bootstrap();
```

Você também pode limitá-lo a um único controller ou handler:

```ts
import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { StrictTypeErrorFilter } from '@ts-typed/nestjs';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseFilters(StrictTypeErrorFilter)
export class UsersController {
  @Post()
  public create(@Body() dto: CreateUserDto) {
    // o dto já foi validado pelo TS Typed nesta fronteira
    return { ok: true };
  }
}
```

> **Atenção:** o `@ts-typed/nestjs` não substitui os pipes de validação do próprio Nest e não instancia seus DTOs. Ele apenas reage a um `StrictTypeError` que o código instrumentado pelo TS Typed já lançou. Esse erro pode vir de um campo de DTO, do retorno de um provider, de uma Entity lida do banco de dados ou de qualquer outro ponto onde exista uma fronteira tipada.

## Como o status code é definido

O `StrictTypeErrorFilter` escolhe o status HTTP de um `StrictTypeError` verificando as regras abaixo, em ordem. A primeira regra que se aplica prevalece.

1. **Um `TypeErrorResponse()` explícito no campo violado.** Usa-se o status do próprio campo, ou `400` se nenhum foi informado. Quem decorou o campo já decidiu como a violação deve aparecer para o cliente, por isso esta regra sempre tem prioridade.
2. **Uma falha do servidor, que retorna `500`.** Isso acontece quando qualquer uma destas condições é verdadeira:
   - O `operation` da violação é `return` ou `resolve`. Nesse caso, o próprio corpo da função ou do método produziu um valor inválido, como um mapper que lê uma linha corrompida.
   - O `contractKind` é `variable`. Isso cobre uma variável local comum, como `const entity = await repo.findOneBy(...)` recebendo dados corrompidos. Nunca é a superfície de uma requisição voltada ao cliente.
   - O campo pertence a uma classe marcada com `@ServerPopulated()`.
3. **Caso contrário, `400`.** A violação é uma entrada do cliente, como um campo inválido de DTO ou um argumento `@Body()` ou `@Param()` malformado.

## `ServerPopulated()`: diferenciando uma Entity de um DTO

Um campo de classe tem a mesma aparência quer venha de uma Entity do TypeORM, quer venha de um DTO. Uma Entity lê dados corrompidos do banco, o que é uma falha do servidor. Um DTO é preenchido pelo `class-transformer` a partir da entrada do cliente, o que é uma falha do cliente. Os dois seguem exatamente o mesmo caminho de validação, então o TS Typed precisa de uma indicação para diferenciá-los.

Marque suas classes de Entity com `@ServerPopulated()`:

```ts
import { ServerPopulated } from '@ts-typed/nestjs'; // reexportado de @ts-typed/compiler
import { Entity, Column } from 'typeorm';

@Entity({ name: 'todos' })
@ServerPopulated()
export class TodoEntity {
  @Column({ type: 'varchar', enum: TodoStatus })
  public status!: TodoStatus;
}
```

Com esse decorator, um valor corrompido de `status` lido do banco responde com `500`. A mesma violação em um DTO sem essa marcação continua respondendo com `400`.

## `TypeErrorResponse()`: uma alternativa por campo ao class-validator

O `@TypeErrorResponse()` permite personalizar a mensagem e, opcionalmente, o status code de um único campo:

```ts
import { TypeErrorResponse } from '@ts-typed/nestjs'; // reexportado de @ts-typed/compiler

export class CreateUserDto {
  @TypeErrorResponse('E-mail inválido', 422)
  public readonly email!: string;

  @TypeErrorResponse('O nome deve ter entre 2 e 100 caracteres')
  public readonly name!: string; // sem status informado -> assume 400
}
```

O decorator é acionado para **qualquer** tipo de violação naquele campo, incluindo tipo incorreto, propriedade extra ou escrita em um campo readonly. Ele substitui apenas a `message` (e o `statusCode`, se você informar um). Todos os demais campos de diagnóstico continuam chegando ao cliente, incluindo `code`, `propertyPath`, `expected`, `received`, `contractKind` e `operation`. O cliente recebe a sua mensagem personalizada e o detalhe completo do que estava errado.

Assim como o restante do TS Typed, este é um mecanismo de violação única.

## `StrictTypeHttpError`: crie o seu próprio filtro

O `StrictTypeErrorFilter` é a opção pronta para uso. Quando você precisa de um tratamento customizado, como logging, um formato de resposta diferente ou internacionalização, use o `StrictTypeHttpError`. Ele expõe o mesmo mapeamento de status e mensagem como um bloco de construção reutilizável.

```ts
import { Catch } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { StrictTypeError } from '@ts-typed/compiler';
import { StrictTypeHttpError } from '@ts-typed/nestjs';

@Catch(StrictTypeError)
export class MeuFiltroProprio implements ExceptionFilter {
  catch(exception: StrictTypeError, host: ArgumentsHost): void {
    const httpError = StrictTypeHttpError.fromStrictTypeError(exception);

    // httpError.getStatus()   -> o status code resolvido
    // httpError.getResponse() -> { statusCode, message, code, propertyPath, expected, received, contractKind, operation, ... }
    // httpError.cause         -> o StrictTypeError original, se você precisar de algo que não está no corpo acima

    meuLogger.warn('validação falhou', { path: httpError.cause.propertyPath });

    const response = host.switchToHttp().getResponse();
    response.status(httpError.getStatus()).json({
      ok: false,
      reason: httpError.getResponse().message,
    });
  }
}
```

O `StrictTypeHttpError` é uma subclasse real de `HttpException` do Nest. Qualquer outra parte da sua stack que já sabe renderizar um `HttpException`, como o tratamento padrão de exceções do Nest ou as ferramentas de schema de erro do Swagger, o entende sem tratamento especial.

## Exemplos de corpo de resposta

Os exemplos a seguir mostram o que o cliente recebe em cada caso. Em nenhum deles a resposta inclui o valor bruto que falhou na validação ou um stack trace.

**Um campo de DTO sem nenhum decorator, com uma incompatibilidade simples de tipo:**

```json
{
  "statusCode": 400,
  "message": "CreateUserDto.age expected number, received string",
  "code": "TYPE_MISMATCH",
  "propertyPath": "CreateUserDto.age",
  "expected": "number",
  "received": "string",
  "contractKind": "property",
  "operation": "initialize"
}
```

**O mesmo campo, decorado com `@TypeErrorResponse('Idade inválida', 422)`:**

```json
{
  "statusCode": 422,
  "message": "Idade inválida",
  "code": "TYPE_MISMATCH",
  "propertyPath": "CreateUserDto.age",
  "expected": "number",
  "received": "string",
  "contractKind": "property",
  "operation": "initialize"
}
```

**Um campo de Entity marcado com `@ServerPopulated()` e com dados corrompidos:**

```json
{
  "statusCode": 500,
  "message": "TodoEntity.status expected TodoStatus, received string",
  "code": "TYPE_MISMATCH",
  "propertyPath": "TodoEntity.status",
  "expected": "TodoStatus",
  "received": "string",
  "contractKind": "property",
  "operation": "initialize"
}
```

## Limitação conhecida: uma violação por requisição

O TS Typed não agrega violações em uma única resposta. Ele valida campo a campo e lança exceção no **primeiro** campo inválido. Isso difere do `class-validator`, que coleta todas as violações e as reporta juntas.

Se o contrato da sua API exige os erros de todos os campos em uma só resposta, mantenha o `class-validator` para essa necessidade específica. O `@TypeErrorResponse()` e o `@ServerPopulated()` resolvem dois problemas: personalizar a mensagem e o status de um campo, e diferenciar Entities de DTOs. Eles não agregam erros.
