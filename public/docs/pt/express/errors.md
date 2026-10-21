# Express: erros

Registre o middleware depois das rotas e antes do fallback. Ele reconhece `StrictTypeError`, envia somente o diagnóstico seguro e passa outros erros para o próximo handler.

```ts
import { typedErrorHandler } from '@ts-typed/express';

app.use(typedErrorHandler({
  onError(error, request) {
    logger.warn({ path: request.path, detail: error.toJSON() }, 'typed contract failed');
  },
  formatResponse(body) {
    return { ok: false, error: body };
  },
}));
```

O corpo padrão tem `statusCode`, `message`, `code`, `propertyPath`, `expected`, `received`, `contractKind` e `operation`, nunca o valor rejeitado ou stack. `onError` recebe a exceção e a requisição para telemetria; se ele falhar, a resposta segura ainda é enviada. `formatResponse` recebe o corpo já sanitizado e pode adaptá-lo ao envelope da API.

Parâmetros/DTOs resultam em `400`. Retornos, resoluções async, variáveis internas e campos `@ServerPopulated()` resultam em `500`. `@TypeErrorResponse('mensagem', 422)` em um campo tem prioridade. Um `AggregateStrictTypeError` inclui `errors`. Para controle total, capture `StrictTypeError` e use `toTypedErrorResponse(error)`; preserve falhas que não são da biblioteca para seu fallback.
