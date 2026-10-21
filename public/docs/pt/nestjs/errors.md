# NestJS: erros

`StrictTypeErrorFilter` é a integração pronta. Ele responde `400` para DTO/parâmetro inválido e `500` para retorno, resolução async, variável interna ou entidade `@ServerPopulated()`. O valor original e a stack nunca entram no corpo.

```ts
import { Catch } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { StrictTypeError } from '@ts-typed/core';
import { StrictTypeHttpError } from '@ts-typed/nestjs';

@Catch(StrictTypeError)
export class ApiTypedErrorFilter implements ExceptionFilter {
  catch(exception: StrictTypeError, host: ArgumentsHost): void {
    const mapped = StrictTypeHttpError.fromStrictTypeError(exception);
    logger.warn({ validation: exception.toJSON() });
    host.switchToHttp().getResponse().status(mapped.getStatus()).json({
      ok: false,
      error: mapped.getResponse(),
    });
  }
}
```

Use esse filtro customizado se você precisa de envelope, i18n ou telemetria; `StrictTypeHttpError` preserva o mesmo mapeamento do filtro padrão. `@TypeErrorResponse('E-mail inválido', 422)` em uma propriedade tem prioridade sobre a heurística e mantém os demais campos diagnósticos. `@ServerPopulated()` identifica entidade/valor vindo do servidor. Uma `AggregateStrictTypeError` expõe a lista segura em `errors`.

Não aplique `@Catch()` amplo para devolver toda exceção como erro de tipo. Outras exceções precisam continuar na política normal de logs e resposta do Nest.
