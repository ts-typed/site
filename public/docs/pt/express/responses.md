# Express: respostas

Respostas devem ser projeções, não linhas do banco:

```ts
import type { TTOptImmut } from '@ts-typed/core';

interface UserResponse { id: string; name: string; email: string }

async function listUsers(): Promise<TTOptImmut<UserResponse[]>> {
  const rows = await repository.list();
  return rows.map(({ id, name, email }) => ({ id, name, email }));
}

app.get('/users', async (_req, res, next) => {
  try { res.json(await listUsers()); } catch (error) { next(error); }
});
```

O retorno validado detecta mapper incompleto ou tipo errado e a projeção impede expor `passwordHash`, tokens ou colunas internas. `TTOptImmut` é para snapshot de objetos/arrays simples: ele valida e congela. Não o aplique a entidades, `Date`, `Map`, `Set` ou objetos com accessors.

Uma falha em retorno/resolução é classificada pelo handler como `500`, não `400`: foi o servidor que quebrou a promessa. Paginação, limite de itens e seleção de colunas vêm antes de qualquer micro-otimização de validação.
