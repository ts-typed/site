# Express: requisições e DTOs

`express.json()` transforma bytes em `unknown`, não em um DTO validado. Passe o body a uma função tipada antes de usá-lo no domínio:

```ts
import { AggregateErrors } from '@ts-typed/core';

@AggregateErrors()
class CreateOrderDto {
  public customerId: string = '';
  public totalCents: number = 0;
}

async function createOrder(dto: CreateOrderDto): Promise<{ id: string }> {
  return orders.create(dto);
}

app.post('/orders', async (req, res, next) => {
  try {
    res.status(201).json(await createOrder(req.body as CreateOrderDto));
  } catch (error) { next(error); }
});
```

O DTO rejeita tipo incorreto, campo exigido ausente e chaves extras. `@AggregateErrors()` é útil para formulário: uma `AggregateStrictTypeError` contém a lista `errors`; sem ele, a primeira falha interrompe o fluxo. Use classes agregadas apenas para dados recém-construídos que em seguida atravessam o parâmetro tipado; não as reutilize como entidades mutáveis de longa vida.

Para regras de domínio, use value objects: `email: Email` de `@ts-typed/validators/global` valida e materializa um e-mail na fronteira. O handler global renderiza o erro; não envie o objeto de exceção ou `req.body` de volta ao cliente.
