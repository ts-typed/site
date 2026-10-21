# NestJS: requisições e DTOs

Uma classe DTO dá defaults, decorators e agregação a um request. O controller pode recebê-la por `@Body()` e o serviço tipado fecha a fronteira:

```ts
import { Body, Controller, Post } from '@nestjs/common';
import { AggregateErrors } from '@ts-typed/core';
import { Email } from '@ts-typed/validators/global';

@AggregateErrors()
class RegisterDto {
  public name: string = '';
  public email!: Email;
  public acceptedTerms: boolean = false;
}

@Controller('accounts')
class AccountsController {
  @Post()
  register(@Body() dto: RegisterDto) { return service.register(dto); }
}
```

Por padrão, a primeira incompatibilidade lança `StrictTypeError`. Com `@AggregateErrors()`, falhas estruturais de objeto/arrays aninhados se tornam uma `AggregateStrictTypeError` com `errors`; o filtro Nest continua reconhecendo-a porque ela herda de `StrictTypeError`. Um parâmetro diretamente `Dto[]` ainda é fail-fast no primeiro item; encapsule a coleção se precisar de relatório de formulário.

O `ValidationPipe({ transform: true })` pode coexistir: a janela de agregação encerra no parâmetro tipado. Evite uma classe agregada como entidade de longa vida; se ela só for mutada e nunca cruzar outra fronteira, sua janela de coleta não fecha. `Email` materializa e valida regra de valor na entrada; um value object inválido falha imediatamente. Veja [Validadores](../validators.md).
