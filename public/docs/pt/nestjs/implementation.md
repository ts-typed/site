# NestJS: implementação

Deixe o controller transportar HTTP e delegue a regra ao serviço tipado. A proteção acontece no parâmetro e retorno, não porque `@Body()` magicamente valida JSON.

```ts
import { Body, Controller, Post } from '@nestjs/common';

interface CreateUserBody { name: string; email: string }
interface UserResponse { id: string; name: string; email: string }

@Controller('users')
export class UsersController {
  @Post()
  create(@Body() body: CreateUserBody): Promise<UserResponse> {
    return this.users.create(body);
  }

  constructor(private readonly users: UsersService) {}
}

export class UsersService {
  async create(input: CreateUserBody): Promise<UserResponse> {
    const row = await repository.insert(input);
    return { id: row.id, name: row.name, email: row.email };
  }
}
```

Anotações no controller e no serviço são contratos distintos e úteis: a primeira é a borda HTTP; a segunda protege futuras chamadas por jobs, eventos ou outros providers. Não retorne a entidade de ORM diretamente; um mapper explícito impede vazamento de colunas internas e faz o retorno ser validado.

Use construtores e value objects para invariantes semânticas. O compilador confirma a forma; não substitui regras como saldo positivo, existência no banco ou autorização.
