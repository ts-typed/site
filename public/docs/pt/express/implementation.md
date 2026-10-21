# Express: implementação

O padrão é separar controlador HTTP, serviço e projeção. O contrato do controlador protege a entrada; o retorno do serviço impede que uma mudança interna vaze para a API.

```ts
import type { Request, Response, NextFunction } from 'express';

interface CreateUserBody { name: string; email: string }
interface UserResponse { id: string; name: string; email: string }

async function createUser(input: CreateUserBody): Promise<UserResponse> {
  const row = await users.insert(input);
  return { id: row.id, name: row.name, email: row.email };
}

export async function postUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await createUser(req.body as CreateUserBody);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}
```

O cast é necessário porque Express tipa `body` de modo amplo, mas não é a garantia: a chamada instrumentada a `createUser` valida o dado em runtime. Sempre encaminhe falhas a `next(error)`; assim `typedErrorHandler` pode responder com um corpo seguro. Não chame `res.json` dentro de um `catch` genérico, pois isso mistura violações de entrada com falhas internas.

Mantenha contratos em handlers, serviços expostos e mappers. O handler HTTP não precisa reproduzir as regras do compilador; sua responsabilidade é transportar a exceção corretamente.
