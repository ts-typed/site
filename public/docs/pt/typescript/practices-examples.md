# TypeScript: práticas e exemplos

Uma implementação útil separa forma de entrada, regra semântica, domínio e formato público:

```ts
import { AggregateErrors } from '@ts-typed/core';
import { Email } from '@ts-typed/validators/global';
import type { TTOptImmut } from '@ts-typed/core';

@AggregateErrors()
class RegisterCustomerDto {
  public name: string = '';
  public email!: Email;
}

interface CustomerResponse { id: string; name: string; email: string }

export async function register(dto: RegisterCustomerDto): Promise<CustomerResponse> {
  const row = await repository.insert({ name: dto.name, email: dto.email });
  return { id: row.id, name: row.name, email: row.email.toString() };
}

export async function list(): Promise<TTOptImmut<CustomerResponse[]>> {
  return (await repository.list()).map((row) => ({
    id: row.id, name: row.name, email: row.email.toString(),
  }));
}
```

O DTO agrega problemas de forma; `Email` garante a regra semântica; o serviço nunca retorna campos internos; a lista descreve um snapshot simples e imutável. Não aplique `TTOptImmut` à entidade de persistência, que ainda pode precisar mudar.

Antes de publicar: execute a saída de `ts-typed build`; coloque contratos em I/O e mappers, não em toda função local; mantenha objetos fechados por padrão; pagine listas; responda com `toJSON()`; e, após a migração, use `compiler.onUnsupported: "error"` no CI. Para o alcance completo, leia [Conceitos centrais](../core-concepts.md).
